const { app, BrowserWindow, dialog, ipcMain, session, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const { renderSequence, cancelRender } = require('./renderService.cjs');

const isDev = !app.isPackaged;
let mainWindow;
let rendererReady = false;
let rendererReadyTimer;
function smokeMarker(name){return process.env[`MAYA_SHADOW_${name}`]||path.join(app.getPath('temp'),`maya-shadow-${name.toLowerCase()}.txt`)}
function markRendererReady(){
  if(rendererReady)return;
  rendererReady=true;
  if(rendererReadyTimer)clearTimeout(rendererReadyTimer);
  if(process.env.MAYA_SHADOW_SMOKE==='1')fs.writeFileSync(smokeMarker('SMOKE_MARKER'),'renderer-ready','utf8');
  if(mainWindow&&!mainWindow.isDestroyed())mainWindow.show();
}
function showRendererFailure(message){
  const details=`Maya Shadow Animation Studio could not load its UI.\n\n${message}`;
  console.error('[Maya Shadow Renderer]',details);
  if(process.env.MAYA_SHADOW_SMOKE==='1'){
    fs.writeFileSync(smokeMarker('SMOKE_FAILURE'),details,'utf8');
    return;
  }
  if(mainWindow&&!mainWindow.isDestroyed()){
    mainWindow.show();
    dialog.showErrorBox('Maya Shadow UI Load Error',details);
  }
}
function createWindow(){
  mainWindow=new BrowserWindow({width:1600,height:1000,minWidth:1100,minHeight:720,backgroundColor:'#0b0f14',show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  mainWindow.once('ready-to-show',()=>{if(rendererReady)mainWindow.show();});
  mainWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  mainWindow.webContents.on('did-finish-load',()=>{if(process.env.MAYA_SHADOW_SMOKE==='1'&&!rendererReady)console.log('[Maya Shadow Renderer] HTML finished loading; waiting for React readiness signal.');});
  mainWindow.webContents.on('did-fail-load',(_event,errorCode,errorDescription,validatedURL)=>showRendererFailure(`Load failed (${errorCode}): ${errorDescription}\nURL: ${validatedURL}`));
  mainWindow.webContents.on('render-process-gone',(_event,details)=>showRendererFailure(`Renderer process stopped: ${details.reason} (exit code ${details.exitCode}).`));
  mainWindow.webContents.on('console-message',(_event,level,message,line,source)=>{if(level>=2)console.error(`[Renderer ${level}] ${message} (${source}:${line})`);});
  rendererReadyTimer=setTimeout(()=>{if(!rendererReady)showRendererFailure('The React renderer did not report ready within 15 seconds.');},15000);
  if(isDev)mainWindow.loadURL('http://127.0.0.1:5173');else mainWindow.loadFile(path.join(__dirname,'..','dist','index.html'));
}
function sendUpdateStatus(status,info={}){if(mainWindow&&!mainWindow.isDestroyed())mainWindow.webContents.send('studio:update-status',{status,...info})}
function sendRenderStatus(status,info={}){if(mainWindow&&!mainWindow.isDestroyed())mainWindow.webContents.send('studio:render-status',{status,...info})}
function configureUpdater(){if(isDev)return;autoUpdater.autoDownload=false;autoUpdater.autoInstallOnAppQuit=true;autoUpdater.allowDowngrade=true;autoUpdater.allowPrerelease=false;autoUpdater.on('checking-for-update',()=>sendUpdateStatus('checking'));autoUpdater.on('update-available',info=>sendUpdateStatus('available',{version:info.version}));autoUpdater.on('update-not-available',()=>sendUpdateStatus('current',{version:app.getVersion()}));autoUpdater.on('download-progress',p=>sendUpdateStatus('downloading',{percent:Math.round(p.percent)}));autoUpdater.on('update-downloaded',info=>sendUpdateStatus('downloaded',{version:info.version}));autoUpdater.on('error',e=>sendUpdateStatus('error',{message:e.message}))}
app.whenReady().then(()=>{
 session.defaultSession.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
 ipcMain.handle('studio:renderer-ready',event=>{if(mainWindow&&event.sender===mainWindow.webContents)markRendererReady();return{status:'ready'}});
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
