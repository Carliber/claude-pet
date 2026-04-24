const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const CLAUDE_DIR = path.join(process.env.USERPROFILE || process.env.HOME, '.claude');
app.setPath('userData', path.join(process.env.USERPROFILE || process.env.HOME, '.claude-tool-electron', 'pet-cache'));
const CLAUDE_PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');
const ROOT_DIR = path.join(__dirname, '..');
const preloadPath = path.join(__dirname, 'preload.js');

let petWindow = null;
let tray = null;
let isQuitting = false;

function createTrayIcon() {
  return nativeImage.createFromPath(path.join(ROOT_DIR, 'assets', 'icon.png'));
}

function createPetWindow() {
  petWindow = new BrowserWindow({
    width: 160,
    height: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: { preload: preloadPath, contextIsolation: true, nodeIntegration: false },
  });
  petWindow.loadFile(path.join(ROOT_DIR, 'assets', 'pet.html'));
  petWindow.once('ready-to-show', () => petWindow.show());
  petWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      petWindow.hide();
    }
  });
}

function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('Claude Pet');
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示宠物', click: () => { if (petWindow) petWindow.show(); } },
    { label: '隐藏宠物', click: () => { if (petWindow) petWindow.hide(); } },
    { type: 'separator' },
    { label: '退出', click: () => { isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { if (petWindow) petWindow.show(); });
}

function sendPetStatus(status) {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.webContents.send('pet:status', status);
  }
}

// --- Global jsonl watcher ---
const lineOffsets = new Map();
const sessionStates = new Map(); // sessionKey -> state (THINKING/CODING/DONE)
let idleTimer = null;

// Priority: CODING > THINKING > DONE > IDLE
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
    // Clear session after showing DONE briefly
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
