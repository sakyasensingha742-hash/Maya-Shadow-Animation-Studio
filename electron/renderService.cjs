const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ffmpegPath = require('ffmpeg-static');
const { captureSequence } = require('./renderCapture.cjs');

let activeProcess = null;
let cancelled = false;

function qualityArgs(quality) {
  if (quality === 'draft') return ['-preset', 'ultrafast', '-crf', '28'];
  if (quality === 'final') return ['-preset', 'slow', '-crf', '18'];
  return ['-preset', 'medium', '-crf', '23'];
}

function buildArgs({ inputPattern, outputPath, fps, format, quality, transparent }) {
  const args = ['-y', '-hide_banner', '-loglevel', 'warning', '-framerate', String(fps), '-i', inputPattern];
  if (format === 'webm') {
    args.push('-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', quality === 'draft' ? '40' : quality === 'final' ? '24' : '32', '-pix_fmt', transparent ? 'yuva420p' : 'yuv420p');
  } else if (format === 'mp4') {
    args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', ...qualityArgs(quality), '-movflags', '+faststart');
  } else {
    args.push('-c:v', 'png');
  }
  args.push(outputPath);
  return args;
}

async function renderSequence(options, onProgress, webContents) {
  if (activeProcess) throw new Error('A render is already running.');
  cancelled = false;
  const {
    inputDir,
    outputPath,
    fps = 24,
    format = 'mp4',
    quality = 'preview',
    transparent = false,
    startFrame = 1,
    endFrame,
    width = 1920,
    height = 1080
  } = options;
  if (!outputPath) throw new Error('Render output path is required.');
  const framesDir = inputDir || path.join(os.tmpdir(), `maya-shadow-render-${Date.now()}`);
  fs.mkdirSync(framesDir, { recursive: true });
  const start = Math.max(1, Number(startFrame) || 1);
  const end = Math.max(start, Number(endFrame) || start);

  if (webContents) {
    onProgress?.({ status: 'rendering', phase: 'capturing', progress: 0, frame: start });
    await captureSequence(webContents, {
      framesDir,
      width,
      height,
      startFrame: start,
      endFrame: end,
      isCancelled: () => cancelled
    }, onProgress);
  }

  if (!fs.existsSync(framesDir)) throw new Error('Render frame directory was not found.');
  if (format === 'mp4' && transparent) throw new Error('Transparent background is not supported by MP4.');
  const pattern = path.join(framesDir, 'frame_%06d.png');
  const args = buildArgs({ inputPattern: pattern, outputPath, fps, format, quality, transparent });
  const total = end - start + 1;

  return new Promise((resolve, reject) => {
    activeProcess = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = '';
    activeProcess.stderr.on('data', chunk => {
      stderr += chunk.toString();
      const matches = stderr.match(/frame=\s*(\d+)/g);
      if (matches?.length) {
        const frame = Number(matches[matches.length - 1].replace(/\D/g, ''));
        onProgress?.({ status: 'rendering', phase: 'encoding', progress: 50 + Math.min(50, Math.round((frame / total) * 50)), frame });
        stderr = stderr.slice(-4000);
      }
    });
    activeProcess.on('error', err => { activeProcess = null; reject(err); });
    activeProcess.on('close', code => {
      const wasCancelled = cancelled || code === null;
      activeProcess = null;
      if (wasCancelled) return reject(new Error('Render cancelled.'));
      if (code !== 0) return reject(new Error(stderr.trim() || `FFmpeg exited with code ${code}`));
      onProgress?.({ status: 'complete', phase: 'encoding', progress: 100 });
      resolve({ outputPath, framesDir });
    });
  });
}

function cancelRender() {
  cancelled = true;
  if (!activeProcess) return true;
  activeProcess.kill('SIGTERM');
  return true;
}

module.exports = { renderSequence, cancelRender, buildArgs };
