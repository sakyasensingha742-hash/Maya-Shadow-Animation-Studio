const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ffmpegPath = require('ffmpeg-static');
const { captureSequence } = require('./renderCapture.cjs');

let activeProcess = null;
let renderActive = false;
let cancelled = false;

const LIMITS = { minWidth: 320, minHeight: 240, maxWidth: 3840, maxHeight: 3840, maxPixels: 3840 * 3840 };

function qualityArgs(quality) {
  if (quality === 'draft') return ['-preset', 'ultrafast', '-crf', '28'];
  if (quality === 'final') return ['-preset', 'slow', '-crf', '18'];
  return ['-preset', 'medium', '-crf', '23'];
}

function validateOptions({ outputPath, fps, format, transparent, startFrame, endFrame, width, height }) {
  const errors = [];
  if (!outputPath) errors.push('Render output path is required.');
  if (!Number.isFinite(width) || width < LIMITS.minWidth || width > LIMITS.maxWidth) errors.push(`Width must be ${LIMITS.minWidth}–${LIMITS.maxWidth}px.`);
  if (!Number.isFinite(height) || height < LIMITS.minHeight || height > LIMITS.maxHeight) errors.push(`Height must be ${LIMITS.minHeight}–${LIMITS.maxHeight}px.`);
  if (Number(width) * Number(height) > LIMITS.maxPixels) errors.push('Resolution exceeds the safe 4K-class render limit.');
  if (![24, 25, 30, 60].includes(Number(fps))) errors.push('FPS must be 24, 25, 30 or 60.');
  if (!['mp4', 'webm', 'png-sequence'].includes(format)) errors.push('Unsupported render format.');
  if (transparent && format === 'mp4') errors.push('Transparent background is not supported by MP4; use WebM or PNG Sequence.');
  if (!Number.isInteger(Number(startFrame)) || Number(startFrame) < 1) errors.push('Start frame must be a positive integer.');
  if (!Number.isInteger(Number(endFrame)) || Number(endFrame) < Number(startFrame)) errors.push('End frame must be greater than or equal to Start frame.');
  return errors;
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

async function copyPngSequence(framesDir, outputPath, onProgress, total) {
  const targetDir = outputPath.toLowerCase().endsWith('.png') ? outputPath.slice(0, -4) : outputPath;
  fs.mkdirSync(targetDir, { recursive: true });
  const frames = fs.readdirSync(framesDir).filter(name => /^frame_\d{6}\.png$/i.test(name)).sort();
  if (!frames.length) throw new Error('No captured PNG frames were found.');
  for (let i = 0; i < frames.length; i += 1) {
    if (cancelled) throw new Error('Render cancelled.');
    fs.copyFileSync(path.join(framesDir, frames[i]), path.join(targetDir, frames[i]));
    onProgress?.({ status: 'rendering', phase: 'encoding', progress: 50 + Math.round(((i + 1) / total) * 50), frame: i + 1 });
  }
  return targetDir;
}

async function renderSequence(options, onProgress, webContents) {
  if (renderActive) throw new Error('A render is already running.');
  renderActive = true;
  cancelled = false;

  try {
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

    const start = Math.max(1, Number(startFrame) || 1);
    const end = Math.max(start, Number(endFrame) || start);
    const normalized = { outputPath, fps: Number(fps), format, transparent, startFrame: start, endFrame: end, width: Number(width), height: Number(height) };
    const errors = validateOptions(normalized);
    if (errors.length) throw new Error(errors.join(' '));

    if (outputPath) {
      const outputDir = format === 'png-sequence'
        ? (outputPath.toLowerCase().endsWith('.png') ? path.dirname(outputPath) : outputPath)
        : path.dirname(outputPath);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const framesDir = inputDir || path.join(os.tmpdir(), `maya-shadow-render-${Date.now()}`);
    fs.mkdirSync(framesDir, { recursive: true });

    if (webContents) {
      onProgress?.({ status: 'rendering', phase: 'capturing', progress: 0, frame: start });
      await captureSequence(webContents, {
        framesDir,
        width: normalized.width,
        height: normalized.height,
        startFrame: start,
        endFrame: end,
        isCancelled: () => cancelled
      }, onProgress);
    }

    if (cancelled) throw new Error('Render cancelled.');
    if (!fs.existsSync(framesDir)) throw new Error('Render frame directory was not found.');
    const total = end - start + 1;
    const pattern = path.join(framesDir, 'frame_%06d.png');

    if (format === 'png-sequence') {
      const sequenceDir = await copyPngSequence(framesDir, outputPath, onProgress, total);
      onProgress?.({ status: 'complete', phase: 'encoding', progress: 100 });
      return { outputPath: sequenceDir, framesDir, format: 'png-sequence' };
    }

    const args = buildArgs({ inputPattern: pattern, outputPath, fps: normalized.fps, format, quality, transparent });
    return await new Promise((resolve, reject) => {
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
        resolve({ outputPath, framesDir, format });
      });
    });
  } finally {
    activeProcess = null;
    renderActive = false;
  }
}

function cancelRender() {
  cancelled = true;
  if (!activeProcess) return true;
  activeProcess.kill('SIGTERM');
  return true;
}

module.exports = { renderSequence, cancelRender, buildArgs, validateOptions };
