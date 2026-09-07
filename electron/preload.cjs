const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mayaShadowDesktop', {
  getAppInfo: () => ipcRenderer.invoke('studio:app-info'),
  checkForUpdate: () => ipcRenderer.invoke('studio:check-update'),
  downloadUpdate: () => ipcRenderer.invoke('studio:download-update'),
  installUpdate: () => ipcRenderer.invoke('studio:install-update'),
  saveProject: (payload) => ipcRenderer.invoke('studio:save-project', payload),
  loadProject: () => ipcRenderer.invoke('studio:load-project'),
  backupProject: (payload) => ipcRenderer.invoke('studio:backup-project', payload),
  chooseRenderOutput: (payload) => ipcRenderer.invoke('studio:render-output-dialog', payload),
  startRender: (payload) => ipcRenderer.invoke('studio:render-start', payload),
  cancelRender: () => ipcRenderer.invoke('studio:render-cancel'),
  onUpdateStatus: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('studio:update-status', listener);
    return () => ipcRenderer.removeListener('studio:update-status', listener);
  },
  onRenderStatus: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('studio:render-status', listener);
    return () => ipcRenderer.removeListener('studio:render-status', listener);
  }
});
