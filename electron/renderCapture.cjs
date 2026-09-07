const fs = require('fs');
const path = require('path');

function waitForRendererReady(webContents, requestId, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error('Timed out waiting for the animation frame to render.'));
        return;
      }
      webContents.executeJavaScript(`window.__mayaShadowRenderReady && window.__mayaShadowRenderReady(${JSON.stringify(requestId)})`).then(ok => {
        if (ok) { clearInterval(timer); resolve(); }
      }).catch(() => {});
    }, 25);
  });
}

async function captureFrame(webContents, frame, requestId, outputPath, width, height) {
  await webContents.executeJavaScript(`window.__mayaShadowRequestFrame && window.__mayaShadowRequestFrame(${JSON.stringify({frame, requestId})})`);
  await waitForRendererReady(webContents, requestId);
  const image = await webContents.capturePage();
  const size = image.getSize();
  const scaleX = size.width / Math.max(1, width);
  const scaleY = size.height / Math.max(1, height);
  const cropWidth = Math.min(size.width, Math.max(1, Math.round(width * scaleX)));
  const cropHeight = Math.min(size.height, Math.max(1, Math.round(height * scaleY)));
  const bitmap = image.crop({x:0,y:0,width:cropWidth,height:cropHeight});
  fs.writeFileSync(outputPath, bitmap.toPNG());
  return {width:cropWidth,height:cropHeight};
}

async function captureSequence(webContents, options, onProgress) {
  const start = Math.max(1, Number(options.startFrame) || 1);
  const end = Math.max(start, Number(options.endFrame) || start);
  const dir = options.framesDir;
  fs.mkdirSync(dir, {recursive:true});
  const total = end - start + 1;
  for (let frame=start; frame<=end; frame += 1) {
    if (options.isCancelled?.()) throw new Error('Render cancelled');
    const requestId = `capture-${Date.now()}-${frame}`;
    const outputPath = path.join(dir, `frame_${String(frame).padStart(6,'0')}.png`);
    await captureFrame(webContents, frame, requestId, outputPath, Number(options.width)||1920, Number(options.height)||1080);
    onProgress?.({status:'capturing',phase:'frames',frame,progress:Math.round(((frame-start+1)/total)*50)});
  }
  return {start,end,framesDir:dir};
}
module.exports = {captureSequence};
