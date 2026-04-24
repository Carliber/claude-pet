const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onPetStatus: (callback) => {
    const handler = (_, status) => callback(status);
    ipcRenderer.on('pet:status', handler);
    return () => ipcRenderer.removeListener('pet:status', handler);
  },
  hideWindow: () => ipcRenderer.send('pet:hide'),
});
