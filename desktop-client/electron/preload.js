const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  connectServer: (ip) => ipcRenderer.invoke('connect-server', ip),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  onConnectionStatus: (callback) => ipcRenderer.on('connection-status', (event, value) => callback(value)),
  onNewBroadcast: (callback) => ipcRenderer.on('new-broadcast', (event, value) => callback(value)),
});
