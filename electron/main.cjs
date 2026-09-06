const { app, BrowserWindow, dialog, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

const isDev = !app.isPackaged;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#0b0f14',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function sendUpdateStatus(status, info = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('studio:update-status', { status, ...info });
  }
}

function configureUpdater() {
  if (isDev) return;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('checking-for-update', () => sendUpdateStatus('checking'));
  autoUpdater.on('update-available', (info) => sendUpdateStatus('available', { version: info.version }));
  autoUpdater.on('update-not-available', () => sendUpdateStatus('current', { version: app.getVersion() }));
  autoUpdater.on('download-progress', (progress) => sendUpdateStatus('downloading', { percent: Math.round(progress.percent) }));
  autoUpdater.on('update-downloaded', (info) => sendUpdateStatus('downloaded', { version: info.version }));
  autoUpdater.on('error', (error) => sendUpdateStatus('error', { message: error.message }));
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  ipcMain.handle('studio:app-info', () => ({ version: app.getVersion(), isDev }));
  ipcMain.handle('studio:check-update', async () => {
    if (isDev) return { status: 'dev' };
    const result = await autoUpdater.checkForUpdates();
    return { status: result?.updateInfo ? 'checked' : 'current', version: result?.updateInfo?.version || app.getVersion() };
  });
  ipcMain.handle('studio:download-update', async () => {
    if (isDev) return { status: 'dev' };
    await autoUpdater.downloadUpdate();
    return { status: 'downloading' };
  });
  ipcMain.handle('studio:install-update', () => {
    if (!isDev) autoUpdater.quitAndInstall(false, true);
    return { status: 'installing' };
  });
  ipcMain.handle('studio:save-project', async (_event, payload) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Maya Shadow Project',
      defaultPath: `${payload?.name || 'maya-shadow-project'}.maya.json`,
      filters: [{ name: 'Maya Shadow Project', extensions: ['maya.json'] }, { name: 'JSON', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2), 'utf8');
    return { canceled: false, filePath: result.filePath };
  });
  ipcMain.handle('studio:load-project', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Maya Shadow Project',
      properties: ['openFile'],
      filters: [{ name: 'Maya Shadow Project', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePaths[0]) return { canceled: true };
    const content = fs.readFileSync(result.filePaths[0], 'utf8');
    return { canceled: false, filePath: result.filePaths[0], content };
  });
  ipcMain.handle('studio:backup-project', async (_event, payload) => {
    const dir = app.getPath('userData');
    const backupDir = path.join(dir, 'backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const filename = `recovery-${new Date().toISOString().replace(/[:.]/g, '-')}.maya.json`;
    const filePath = path.join(backupDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return { filePath };
  });

  configureUpdater();
  createWindow();
  if (!isDev) setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 5000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
