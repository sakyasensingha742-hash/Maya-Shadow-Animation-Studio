const { app, BrowserWindow, dialog, ipcMain, session, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const { renderSequence, cancelRender } = require('./renderService.cjs');

const isDev = !app.isPackaged;
let mainWindow;
function createWindow(){mainWindow=new BrowserWindow({width:1600,height:1000,minWidth:1100,minHeight:720,backgroundColor:'#0b0f14',show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});mainWindow.once('ready-to-show',()=>mainWindow.show());mainWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));if(isDev)mainWindow.loadURL('http://127.0.0.1:5173');else mainWindow.loadFile(path.join(__dirname,'..','dist','index.html'))}
function sendUpdateStatus(status,info={}){if(mainWindow&&!mainWindow.isDestroyed())mainWindow.webContents.send('studio:update-status',{status,...info})}
function sendRenderStatus(status,info={}){if(mainWindow&&!mainWindow.isDestroyed())mainWindow.webContents.send('studio:render-status',{status,...info})}
function configureUpdater(){if(isDev)return;autoUpdater.autoDownload=false;autoUpdater.autoInstallOnAppQuit=true;autoUpdater.allowDowngrade=true;autoUpdater.allowPrerelease=false;autoUpdater.on('checking-for-update',()=>sendUpdateStatus('checking'));autoUpdater.on('update-available',info=>sendUpdateStatus('available',{version:info.version}));autoUpdater.on('update-not-available',()=>sendUpdateStatus('current',{version:app.getVersion()}));autoUpdater.on('download-progress',p=>sendUpdateStatus('downloading',{percent:Math.round(p.percent)}));autoUpdater.on('update-downloaded',info=>sendUpdateStatus('downloaded',{version:info.version}));autoUpdater.on('error',e=>sendUpdateStatus('error',{message:e.message}))}
app.whenReady().then(()=>{
 session.defaultSession.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
 ipcMain.handle('studio:app-info',()=>({version:app.getVersion(),isDev}));
 ipcMain.handle('studio:check-update',async()=>{if(isDev)return{status:'dev'};try{const r=await autoUpdater.checkForUpdates();return{status:r?.updateInfo?'checked':'current',version:r?.updateInfo?.version||app.getVersion()}}catch(e){sendUpdateStatus('error',{message:e.message});throw e}});
 ipcMain.handle('studio:download-update',async()=>{if(isDev)return{status:'dev'};await autoUpdater.downloadUpdate();return{status:'downloading'}});
 ipcMain.handle('studio:install-update',()=>{if(!isDev)autoUpdater.quitAndInstall(false,true);return{status:'installing'}});
 ipcMain.handle('studio:open-releases',async()=>{await shell.openExternal('https://github.com/sakyasensingha742-hash/Maya-Shadow-Animation-Studio/releases');return{status:'opened'}});
 ipcMain.handle('studio:save-project',async(_event,payload)=>{const r=await dialog.showSaveDialog(mainWindow,{title:'Save Maya Shadow Project',defaultPath:`${payload?.name||'maya-shadow-project'}.maya.json`,filters:[{name:'Maya Shadow Project',extensions:['maya.json']},{name:'JSON',extensions:['json']}]});if(r.canceled||!r.filePath)return{canceled:true};fs.writeFileSync(r.filePath,JSON.stringify(payload,null,2),'utf8');return{canceled:false,filePath:r.filePath}});
 ipcMain.handle('studio:load-project',async()=>{const r=await dialog.showOpenDialog(mainWindow,{title:'Open Maya Shadow Project',properties:['openFile'],filters:[{name:'Maya Shadow Project',extensions:['json']}]});if(r.canceled||!r.filePaths[0])return{canceled:true};return{canceled:false,filePath:r.filePaths[0],content:fs.readFileSync(r.filePaths[0],'utf8')}});
 ipcMain.handle('studio:backup-project',async(_event,payload)=>{const dir=path.join(app.getPath('userData'),'backups');fs.mkdirSync(dir,{recursive:true});const filePath=path.join(dir,`recovery-${new Date().toISOString().replace(/[:.]/g,'-')}.maya.json`);fs.writeFileSync(filePath,JSON.stringify(payload,null,2),'utf8');return{filePath}});
 ipcMain.handle('studio:render-output-dialog',async(_event,payload={})=>{const extension=payload.format==='webm'?'webm':payload.format==='png-sequence'?'png':'mp4';const r=await dialog.showSaveDialog(mainWindow,{title:'Choose Render Output',defaultPath:payload.defaultName||`maya-shadow-render.${extension}`,filters:[{name:extension.toUpperCase(),extensions:[extension]}]});return r.canceled||!r.filePath?{canceled:true}:{canceled:false,filePath:r.filePath}});
 ipcMain.handle('studio:render-start',async(event,payload)=>{try{sendRenderStatus('rendering',{phase:'capturing',progress:0});const result=await renderSequence(payload,info=>sendRenderStatus(info.status,info),event.sender);return{status:'complete',...result}}catch(e){sendRenderStatus('error',{message:e.message});return{status:'error',message:e.message}}});
 ipcMain.handle('studio:render-cancel',()=>({status:cancelRender()?'cancelling':'idle'}));
 configureUpdater();createWindow();if(!isDev)setTimeout(()=>autoUpdater.checkForUpdates().catch(()=>{}),5000);app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
