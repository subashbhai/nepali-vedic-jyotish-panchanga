const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  printPage: () => ipcRenderer.invoke('print-page'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: (customUrl) => ipcRenderer.invoke('download-update', customUrl),
  restartAndInstall: () => ipcRenderer.invoke('restart-and-install'),
  onUpdaterStatus: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('updater-status', subscription);
    return () => ipcRenderer.removeListener('updater-status', subscription);
  },
});
