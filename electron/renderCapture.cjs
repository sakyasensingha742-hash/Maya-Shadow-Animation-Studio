const fs = require('fs');
const path = require('path');
const { BrowserWindow } = require('electron');

async function requestFrame(webContents, frame, requestId) {
  const script = `(async()=>{
    const payload=${JSON.stringify({ frame, requestId })};
    window.__mayaShadowCaptureRequest=payload;
    if(typeof window.__mayaShadowRequestFrame==='function'){
      window.__mayaShadowRequestFrame(payload);
    }else{
      const ranges=[...document.querySelectorAll('input[type="range"]')].filter(el=>{
        const min=Number(el.min||0),max=Number(el.max||0);
        return max>=payload.frame&&min<=payload.frame;
      });
      const target=ranges.find(el=>/frame|timeline/i.test([el.getAttribute('aria-label'),el.title,el.name].filter(Boolean).join(' ')))||ranges.find(el=>Number(el.max||0)>=payload.frame&&Number(el.max||0)<=1000);
      if(target){
        const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
        if(setter)setter.call(target,String(payload.frame));else target.value=String(payload.frame);
        target.dispatchEvent(new Event('input',{bubbles:true}));
        target.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    window.__mayaShadowCaptureReady=payload.requestId;
    return true;
  })()`;
  return webContents.executeJavaScript(script);
}

function waitForRendererReady(webContents, requestId, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error('Timed out waiting for animation frame to render.'));
        return;
      }
      const readyScript = 'window.__mayaShadowCaptureReady===' + JSON.stringify(requestId) + '||Boolean(window.__mayaShadowRenderReady&&window.__mayaShadowRenderReady(' + JSON.stringify(requestId) + '))';
      webContents.executeJavaScript(readyScript).then(ok => {
        if (ok) {
          clearInterval(timer);
          resolve();
        }
      }).catch(() => {});
    }, 25);
  });
}

async function prepareRenderViewport(webContents, width, height) {
  const win = BrowserWindow.fromWebContents(webContents);
  if (!win) throw new Error('Render window is unavailable.');

  const targetWidth = Math.max(320, Math.round(Number(width) || 1920));
  const targetHeight = Math.max(240, Math.round(Number(height) || 1080));
  const state = {
    bounds: win.getBounds(),
    visible: win.isVisible(),
    maximized: win.isMaximized(),
    fullscreen: win.isFullScreen()
  };

  if (state.fullscreen) win.setFullScreen(false);
  if (state.maximized) win.unmaximize();
  win.hide();
  win.setContentSize(targetWidth, targetHeight, false);

  const styleText = [
    'html,body,#root{width:' + targetWidth + 'px!important;height:' + targetHeight + 'px!important;overflow:hidden!important}',
    '.studio{display:block!important;width:' + targetWidth + 'px!important;height:' + targetHeight + 'px!important}',
    '.studio>.topbar,.studio>.toolbar,.studio>.timeline,.studio>footer{display:none!important}',
    '.workspace{display:block!important;width:' + targetWidth + 'px!important;height:' + targetHeight + 'px!important}',
    '.left-panel,.right-panel,.canvas-tabs{display:none!important}',
    '.canvas-area{display:block!important;width:' + targetWidth + 'px!important;height:' + targetHeight + 'px!important;overflow:hidden!important}',
    '.stage-wrap{display:block!important;width:' + targetWidth + 'px!important;height:' + targetHeight + 'px!important;overflow:hidden!important;background:#000!important}',
    '.stage{width:' + targetWidth + 'px!important;height:' + targetHeight + 'px!important;max-width:none!important;aspect-ratio:auto!important;transform:none!important;box-shadow:none!important}'
  ].join('');

  const styleScript = '(()=>{let s=document.getElementById(\'__mayaShadowRenderStyle\');if(!s){s=document.createElement(\'style\');s.id=\'__mayaShadowRenderStyle\';document.head.appendChild(s)}s.textContent=' + JSON.stringify(styleText) + ';return true})()';
  await webContents.executeJavaScript(styleScript);
  await new Promise(resolve => setTimeout(resolve, 50));

  return async () => {
    await webContents.executeJavaScript("document.getElementById('__mayaShadowRenderStyle')?.remove();true").catch(() => {});
    win.setBounds(state.bounds);
    if (state.fullscreen) win.setFullScreen(true);
    else if (state.maximized) win.maximize();
    if (state.visible) win.show();
  };
}

async function captureFrame(webContents, frame, requestId, outputPath, width, height) {
  await requestFrame(webContents, frame, requestId);
  await waitForRendererReady(webContents, requestId);
  const targetWidth = Math.max(1, Math.round(Number(width) || 1920));
  const targetHeight = Math.max(1, Math.round(Number(height) || 1080));
  const image = await webContents.capturePage({ x: 0, y: 0, width: targetWidth, height: targetHeight }, { stayHidden: true });
  const size = image.getSize();
  const bitmap = size.width === targetWidth && size.height === targetHeight
    ? image
    : image.resize({ width: targetWidth, height: targetHeight });
  fs.writeFileSync(outputPath, bitmap.toPNG());
  return { width: targetWidth, height: targetHeight };
}

async function captureSequence(webContents, options, onProgress) {
  const start = Math.max(1, Number(options.startFrame) || 1);
  const end = Math.max(start, Number(options.endFrame) || start);
  const dir = options.framesDir;
  if (!dir) throw new Error('Render frames directory is required.');
  fs.mkdirSync(dir, { recursive: true });

  const width = Math.max(320, Math.round(Number(options.width) || 1920));
  const height = Math.max(240, Math.round(Number(options.height) || 1080));
  const total = end - start + 1;
  const restoreViewport = await prepareRenderViewport(webContents, width, height);

  try {
    for (let frame = start; frame <= end; frame++) {
      if (options.isCancelled?.()) throw new Error('Render cancelled');
      const requestId = 'capture-' + Date.now() + '-' + frame;
      const outputPath = path.join(dir, 'frame_' + String(frame).padStart(6, '0') + '.png');
      await captureFrame(webContents, frame, requestId, outputPath, width, height);
      onProgress?.({
        status: 'capturing',
        phase: 'frames',
        frame,
        progress: Math.round(((frame - start + 1) / total) * 50)
      });
    }
    return { start, end, framesDir: dir };
  } finally {
    await restoreViewport();
  }
}

module.exports = { captureSequence };
