const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const CLAUDE_DIR = path.join(process.env.USERPROFILE || process.env.HOME, '.claude');
const PET_DATA_DIR = path.join(process.env.USERPROFILE || process.env.HOME, '.claude-tool-electron', 'pet-cache');
app.setPath('userData', PET_DATA_DIR);
const CLAUDE_PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');
const ROOT_DIR = path.join(__dirname, '..');
const preloadPath = path.join(__dirname, 'preload.js');
const SETTINGS_PATH = path.join(PET_DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = { skin: 'crab', showBubble: true, compact: false };
const AVAILABLE_SKINS = [
  { id: 'crab', label: '螃蟹' },
  { id: 'penguin', label: '企鹅' },
];

let petWindow = null;
let tray = null;
let isQuitting = false;
let settings = { ...DEFAULT_SETTINGS };

// --- Settings ---
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
      settings = { ...DEFAULT_SETTINGS, ...data };
    }
  } catch {}
}

function saveSettings() {
  try {
    if (!fs.existsSync(PET_DATA_DIR)) fs.mkdirSync(PET_DATA_DIR, { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {}
}

function sendSettings() {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.webContents.send('pet:settings', settings);
  }
}

function updateSettings(patch) {
  Object.assign(settings, patch);
  saveSettings();
  sendSettings();
  rebuildTrayMenu();
  if ('compact' in patch) resizeWindow();
}

function resizeWindow() {
  if (!petWindow || petWindow.isDestroyed()) return;
  if (settings.compact) {
    petWindow.setSize(130, 130);
  } else {
    petWindow.setSize(160, 200);
  }
}

// --- Window & Tray ---
function createTrayIcon() {
  return nativeImage.createFromPath(path.join(ROOT_DIR, 'assets', 'icon.png'));
}

function createPetWindow() {
  const size = settings.compact ? [130, 130] : [160, 200];
  petWindow = new BrowserWindow({
    width: size[0], height: size[1],
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: { preload: preloadPath, contextIsolation: true, nodeIntegration: false },
  });
  petWindow.loadFile(path.join(ROOT_DIR, 'assets', 'pet.html'));
  petWindow.once('ready-to-show', () => {
    petWindow.show();
    sendSettings();
  });
  petWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      petWindow.hide();
    }
  });
  petWindow.webContents.on('context-menu', () => {
    const menu = Menu.buildFromTemplate([
      { label: '皮肤', submenu: AVAILABLE_SKINS.map(s => ({
          label: s.label,
          type: 'radio',
          checked: settings.skin === s.id,
          click: () => updateSettings({ skin: s.id }),
        }))
      },
      { type: 'separator' },
      { label: '显示状态气泡', type: 'checkbox', checked: settings.showBubble,
        click: (item) => updateSettings({ showBubble: item.checked }) },
      { label: '紧凑模式', type: 'checkbox', checked: settings.compact,
        click: (item) => updateSettings({ compact: item.checked }) },
      { type: 'separator' },
      { label: '隐藏宠物', click: () => petWindow.hide() },
      { label: '退出', click: () => { isQuitting = true; app.quit(); } },
    ]);
    menu.popup({ window: petWindow });
  });
}

function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('Claude Pet');
  rebuildTrayMenu();
  tray.on('double-click', () => { if (petWindow) petWindow.show(); });
}

function rebuildTrayMenu() {
  if (!tray) return;
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示宠物', click: () => { if (petWindow) petWindow.show(); } },
    { label: '隐藏宠物', click: () => { if (petWindow) petWindow.hide(); } },
    { type: 'separator' },
    { label: '皮肤', submenu: AVAILABLE_SKINS.map(s => ({
        label: s.label,
        type: 'radio',
        checked: settings.skin === s.id,
        click: () => updateSettings({ skin: s.id }),
      }))
    },
    { label: '显示状态气泡', type: 'checkbox', checked: settings.showBubble,
      click: (item) => updateSettings({ showBubble: item.checked }) },
    { label: '紧凑模式', type: 'checkbox', checked: settings.compact,
      click: (item) => updateSettings({ compact: item.checked }) },
    { type: 'separator' },
    { label: '退出', click: () => { isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(contextMenu);
}

function sendPetStatus(status) {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.webContents.send('pet:status', status);
  }
}

// --- Global jsonl watcher ---
const lineOffsets = new Map();
const sessionStates = new Map();
let idleTimer = null;

const STATE_PRIORITY = { CODING: 3, EXECUTING: 3, THINKING: 2, ANALYZING: 2, DONE: 1, IDLE: 0, ERROR: 0 };

function getAggregatedState() {
  let best = 'IDLE';
  let bestP = 0;
  for (const [, state] of sessionStates) {
    const p = STATE_PRIORITY[state] || 0;
    if (p > bestP) { bestP = p; best = state; }
  }
  return best;
}

function updateSessionState(key, state) {
  if (state === 'DONE') {
    sessionStates.set(key, state);
    setTimeout(() => {
      sessionStates.delete(key);
      sendPetStatus(getAggregatedState());
    }, 3000);
  } else {
    sessionStates.set(key, state);
  }
  sendPetStatus(getAggregatedState());
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    sessionStates.clear();
    sendPetStatus('IDLE');
  }, 60000);
}

function startGlobalWatcher() {
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) {
    console.log('[pet] Claude projects dir not found, retrying in 10s:', CLAUDE_PROJECTS_DIR);
    setTimeout(startGlobalWatcher, 10000);
    return;
  }

  scanLineCounts();

  try {
    for (const dirName of fs.readdirSync(CLAUDE_PROJECTS_DIR)) {
      const dirPath = path.join(CLAUDE_PROJECTS_DIR, dirName);
      if (!fs.statSync(dirPath).isDirectory()) continue;
      watchProjectDir(dirPath);
    }
  } catch (e) {
    console.error('[pet] Error scanning projects:', e.message);
  }

  fs.watch(CLAUDE_PROJECTS_DIR, (eventType, filename) => {
    if (!filename) return;
    const dirPath = path.join(CLAUDE_PROJECTS_DIR, filename);
    try {
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        watchProjectDir(dirPath);
      }
    } catch {}
  });

  console.log('[pet] Global watcher started on:', CLAUDE_PROJECTS_DIR);
}

function scanLineCounts() {
  try {
    for (const dirName of fs.readdirSync(CLAUDE_PROJECTS_DIR)) {
      const dirPath = path.join(CLAUDE_PROJECTS_DIR, dirName);
      if (!fs.statSync(dirPath).isDirectory()) continue;
      for (const f of fs.readdirSync(dirPath).filter(f => f.endsWith('.jsonl'))) {
        const key = dirName + '/' + f;
        const content = fs.readFileSync(path.join(dirPath, f), 'utf-8');
        lineOffsets.set(key, content.split('\n').filter(Boolean).length);
      }
    }
  } catch {}
}

const watchedDirs = new Set();

function watchProjectDir(dirPath) {
  const dirName = path.basename(dirPath);
  if (watchedDirs.has(dirName)) return;
  watchedDirs.add(dirName);

  let debounceTimer = null;

  const watcher = fs.watch(dirPath, (eventType, filename) => {
    if (!filename || !filename.endsWith('.jsonl')) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => processJsonlChange(dirPath, dirName, filename), 300);
  });

  watcher.on('error', () => {});
}

function processJsonlChange(dirPath, dirName, filename) {
  try {
    const filePath = path.join(dirPath, filename);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    const key = dirName + '/' + filename;
    const prevCount = lineOffsets.get(key) || 0;
    if (lines.length <= prevCount) { lineOffsets.set(key, lines.length); return; }

    for (let i = prevCount; i < lines.length; i++) {
      try {
        const o = JSON.parse(lines[i]);
        if (o.type === 'assistant' && o.message) {
          if (o.message.stop_reason === 'tool_use') {
            updateSessionState(key, 'CODING');
            resetIdleTimer();
          } else if (o.message.stop_reason === 'end_turn') {
            updateSessionState(key, 'DONE');
            resetIdleTimer();
          }
        } else if (o.type === 'user' && o.message) {
          updateSessionState(key, 'THINKING');
          resetIdleTimer();
        }
      } catch {}
    }
    lineOffsets.set(key, lines.length);
  } catch {}
}

loadSettings();
app.whenReady().then(() => {
  createPetWindow();
  createTray();
  startGlobalWatcher();
  ipcMain.on('pet:hide', () => { if (petWindow && !petWindow.isDestroyed()) petWindow.hide(); });
});

app.on('before-quit', () => { isQuitting = true; });

app.on('window-all-closed', (e) => {
  // Prevent quitting — pet lives in tray
});
