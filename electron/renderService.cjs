const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');
const { captureSequence } = require('./renderCapture.cjs');

let activeProcess = null;
let renderActive = false;
let cancelled = false;

const LIMITS = { minWidth: 320, minHeight: 240, maxWidth: 3840, maxHeight: 3840, maxPixels: 3840 * 3840 };

function getFfmpegPath() {
  if (app.isPackaged) {
    const packagedPath = path.join(process.resourcesPath, 'ffmpeg', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
    if (fs.existsSync(packagedPath)) return packagedPath;
    throw new Error(`Packaged FFmpeg binary was not found: ${packagedPath}`);
  }
  try {
    return require('ffmpeg-static');
  } catch (error) {
    throw new Error(`FFmpeg runtime is unavailable: ${error.message}`);
  }
}

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

function buildArgs({ inputPattern, outputPath, fps, format, quality, transparent, startFrame = 1 }) {
  const args = ['-y', '-hide_banner', '-loglevel', 'warning', '-nostats', '-progress', 'pipe:2', '-framerate', String(fps), '-start_number', String(startFrame), '-i', inputPattern];
  if (format === 'webm') args.push('-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', quality === 'draft' ? '40' : quality === 'final' ? '24' : '32', '-pix_fmt', transparent ? 'yuva420p' : 'yuv420p');
  else if (format === 'mp4') args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', ...qualityArgs(quality), '-movflags', '+faststart');
  else args.push('-c:v', 'png');
  args.push(outputPath);
  return args;
}

function removePath(target) { try { fs.rmSync(target, { recursive: true, force: true }); } catch {} }
function removeTempDir(dir) { removePath(dir); }
function createSiblingTempPath(targetPath, label = 'rendering') {
  const absolute = path.resolve(targetPath);
  const ext = path.extname(absolute);
  const base = ext ? path.basename(absolute, ext) : path.basename(absolute);
  return path.join(path.dirname(absolute), `.${base}.${label}-${Date.now()}-${process.pid}${ext}`);
}
function commitFileOutput(tempPath, outputPath) { if (!fs.existsSync(tempPath)) throw new Error('Render completed without producing an output file.'); removePath(outputPath); fs.renameSync(tempPath, outputPath); }
function commitDirectoryOutput(tempDir, outputDir) { if (!fs.existsSync(tempDir)) throw new Error('Render completed without producing an output directory.'); removePath(outputDir); fs.renameSync(tempDir, outputDir); }

async function copyPngSequence(framesDir, outputPath, onProgress, total) {
  const targetDir = outputPath.toLowerCase().endsWith('.png') ? outputPath.slice(0, -4) : outputPath;
  const stagingDir = createSiblingTempPath(targetDir, 'sequence');
  removePath(stagingDir);
  fs.mkdirSync(stagingDir, { recursive: true });
  try {
    const frames = fs.readdirSync(framesDir).filter(name => /^frame_\d{6}\.png$/i.test(name)).sort();
    if (!frames.length) throw new Error('No captured PNG frames were found.');
    for (let i = 0; i < frames.length; i += 1) {
      if (cancelled) throw new Error('Render cancelled.');
      fs.copyFileSync(path.join(framesDir, frames[i]), path.join(stagingDir, frames[i]));
      onProgress?.({ status: 'rendering', phase: 'encoding', progress: 50 + Math.min(50, Math.round(((i + 1) / total) * 50)), frame: i + 1 });
    }
    commitDirectoryOutput(stagingDir, targetDir);
    return targetDir;
  } catch (error) { removePath(stagingDir); throw error; }
}

async function renderSequence(options, onProgress, webContents) {
  if (renderActive) throw new Error('A render is already running.');
  renderActive = true; cancelled = false;
  let framesDir = null; let ownsFramesDir = false; let temporaryOutputPath = null;
  try {
    const { inputDir, outputPath, fps = 24, format = 'mp4', quality = 'preview', transparent = false, startFrame = 1, endFrame, width = 1920, height = 1080 } = options;
    const start = Math.max(1, Number(startFrame) || 1);
    const end = Math.max(start, Number(endFrame) || start);
    const normalized = { outputPath, fps: Number(fps), format, transparent, startFrame: start, endFrame: end, width: Number(width), height: Number(height) };
    const errors = validateOptions(normalized);
    if (errors.length) throw new Error(errors.join(' '));
    if (outputPath) {
      const outputDir = format === 'png-sequence' ? (outputPath.toLowerCase().endsWith('.png') ? path.dirname(outputPath) : outputPath) : path.dirname(outputPath);
      fs.mkdirSync(outputDir, { recursive: true });
    }
    ownsFramesDir = !inputDir;
    framesDir = inputDir || path.join(os.tmpdir(), `maya-shadow-render-${Date.now()}-${process.pid}`);
    fs.mkdirSync(framesDir, { recursive: true });
    if (webContents) {
      onProgress?.({ status: 'rendering', phase: 'capturing', progress: 0, frame: start });
      await captureSequence(webContents, { framesDir, width: normalized.width, height: normalized.height, startFrame: start, endFrame: end, isCancelled: () => cancelled }, onProgress);
    }
    if (cancelled) throw new Error('Render cancelled.');
    if (!fs.existsSync(framesDir)) throw new Error('Render frame directory was not found.');
    const total = end - start + 1;
    const pattern = path.join(framesDir, 'frame_%06d.png');
    if (format === 'png-sequence') {
      const sequenceDir = await copyPngSequence(framesDir, outputPath, onProgress, total);
      onProgress?.({ status: 'complete', phase: 'encoding', progress: 100 });
      return { outputPath: sequenceDir, framesDir: ownsFramesDir ? null : framesDir, format: 'png-sequence' };
    }
    temporaryOutputPath = createSiblingTempPath(outputPath, 'video');
    removePath(temporaryOutputPath);
    const args = buildArgs({ inputPattern: pattern, outputPath: temporaryOutputPath, fps: normalized.fps, format, quality, transparent, startFrame: start });
    const ffmpegPath = getFfmpegPath();
    return await new Promise((resolve, reject) => {
      activeProcess = spawn(ffmpegPath, args, { windowsHide: true });
      let stderr = ''; let progressBuffer = ''; let lastFrame = 0;
      activeProcess.stderr.on('data', chunk => {
        progressBuffer += chunk.toString();
        const lines = progressBuffer.split(/\r?\n/); progressBuffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim(); if (!trimmed) continue;
          if (/^frame=\d+$/.test(trimmed)) {
            const frame = Number(trimmed.slice(6));
            if (Number.isFinite(frame) && frame >= lastFrame) {
              lastFrame = frame;
              const ratio = Math.max(0, Math.min(1, frame / total));
              onProgress?.({ status: 'rendering', phase: 'encoding', progress: 50 + Math.round(ratio * 50), frame });
            }
          } else if (!/^out_/.test(trimmed) && !/^progress=/.test(trimmed) && !/^stream_/.test(trimmed) && !/^bitrate=/.test(trimmed) && !/^fps=/.test(trimmed) && !/^speed=/.test(trimmed) && !/^dup_frames=/.test(trimmed) && !/^drop_frames=/.test(trimmed) && !/^total_size=/.test(trimmed) && !/^out_time/.test(trimmed)) stderr = `${stderr}\n${trimmed}`.slice(-12000);
        }
      });
      activeProcess.on('error', err => { activeProcess = null; reject(err); });
      activeProcess.on('close', code => {
        const wasCancelled = cancelled || code === null; activeProcess = null;
        if (wasCancelled) return reject(new Error('Render cancelled.'));
        if (code !== 0) return reject(new Error(`${stderr}${progressBuffer ? `\n${progressBuffer}` : ''}`.trim() || `FFmpeg exited with code ${code}`));
        try { commitFileOutput(temporaryOutputPath, outputPath); temporaryOutputPath = null; onProgress?.({ status: 'complete', phase: 'encoding', progress: 100 }); resolve({ outputPath, framesDir: ownsFramesDir ? null : framesDir, format }); }
        catch (error) { reject(error); }
      });
    });
  } finally {
    activeProcess = null; if (temporaryOutputPath) removePath(temporaryOutputPath); if (ownsFramesDir && framesDir) removeTempDir(framesDir); renderActive = false;
  }
}

function cancelRender() { cancelled = true; if (!activeProcess) return true; activeProcess.kill('SIGTERM'); return true; }
module.exports = { renderSequence, cancelRender, buildArgs, validateOptions, getFfmpegPath };
