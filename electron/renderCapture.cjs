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
      webContents.executeJavaScript(`window.__mayaShadowRenderReady && window.__mayaShadowRenderReady(${JSON.stringify(requestId)})`)
        .then(ok => { if (ok) { clearInterval(timer); resolve(); } })
        .catch(() => {});
    }, 25);
  });
}

async function getStageBounds(webContents) {
  const bounds = await webContents.executeJavaScript(`(() => {
    const el = document.querySelector('.stage');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height, dpr: window.devicePixelRatio || 1 };
  })()`);
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) throw new Error('Animation stage was not found for rendering.');
  return bounds;
}

async function captureFrame(webContents, frame, requestId, outputPath, width, height) {
  await webContents.executeJavaScript(`window.__mayaShadowRequestFrame && window.__mayaShadowRequestFrame(${JSON.stringify({ frame, requestId })})`);
  await waitForRendererReady(webContents, requestId);
  const bounds = await getStageBounds(webContents);
  const image = await webContents.capturePage({
    x: Math.max(0, Math.round(bounds.x)),
    y: Math.max(0, Math.round(bounds.y)),
    width: Math.max(1, Math.round(bounds.width)),
    height: Math.max(1, Math.round(bounds.height))
  });
  const targetWidth = Math.max(1, Number(width) || Math.round(bounds.width));
  const targetHeight = Math.max(1, Number(height) || Math.round(bounds.height));
  const bitmap = image.resize({ width: targetWidth, height: targetHeight });
  fs.writeFileSync(outputPath, bitmap.toPNG());
  return { width: targetWidth, height: targetHeight };
}

async function captureSequence(webContents, options, onProgress) {
  const start = Math.max(1, Number(options.startFrame) || 1);
  const end = Math.max(start, Number(options.endFrame) || start);
  const dir = options.framesDir;
  fs.mkdirSync(dir, { recursive: true });
  const total = end - start + 1;
  for (let frame = start; frame <= end; frame += 1) {
    if (options.isCancelled?.()) throw new Error('Render cancelled');
    const requestId = `capture-${Date.now()}-${frame}`;
    const outputPath = path.join(dir, `frame_${String(frame).padStart(6, '0')}.png`);
    await captureFrame(webContents, frame, requestId, outputPath, Number(options.width) || 1920, Number(options.height) || 1080);
    onProgress?.({ status: 'capturing', phase: 'frames', frame, progress: Math.round(((frame - start + 1) / total) * 50) });
  }
  return { start, end, framesDir: dir };
}

module.exports = { captureSequence };
