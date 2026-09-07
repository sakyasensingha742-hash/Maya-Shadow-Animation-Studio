const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

let activeProcess = null;

function qualityArgs(quality) {
  if (quality === 'draft') return ['-preset', 'ultrafast', '-crf', '28'];
  if (quality === 'final') return ['-preset', 'slow', '-crf', '18'];
  return ['-preset', 'medium', '-crf', '23'];
}

function buildArgs({ inputPattern, outputPath, fps, format, quality, transparent }) {
  const args = ['-y', '-hide_banner', '-loglevel', 'warning', '-framerate', String(fps), '-i', inputPattern];
  if (format === 'webm') {
    args.push('-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', quality === 'draft' ? '40' : quality === 'final' ? '24' : '32');
    if (transparent) args.push('-pix_fmt', 'yuva420p');
    else args.push('-pix_fmt', 'yuv420p');
  } else if (format === 'mp4') {
    args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', ...qualityArgs(quality), '-movflags', '+faststart');
  } else {
    args.push('-c:v', 'png');
  }
  args.push(outputPath);
  return args;
}

function renderSequence(options, onProgress) {
  if (activeProcess) throw new Error('A render is already running.');
  const { inputDir, outputPath, fps = 24, format = 'mp4', quality = 'preview', transparent = false, startFrame = 1, endFrame } = options;
  if (!inputDir || !outputPath) throw new Error('Render input and output paths are required.');
  if (!fs.existsSync(inputDir)) throw new Error('Render frame directory was not found.');
  if (format === 'mp4' && transparent) throw new Error('Transparent background is not supported by MP4.');
  const pattern = path.join(inputDir, 'frame_%06d.png');
  const args = buildArgs({ inputPattern: pattern, outputPath, fps, format, quality, transparent });
  if (startFrame > 1) args.splice(0, 0, '-start_number', String(startFrame));
  const total = endFrame && endFrame >= startFrame ? endFrame - startFrame + 1 : 0;
  return new Promise((resolve, reject) => {
    activeProcess = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = '';
    activeProcess.stderr.on('data', chunk => {
      stderr += chunk.toString();
      const matches = stderr.match(/frame=\s*(\d+)/g);
      if (matches?.length) {
        const frame = Number(matches[matches.length - 1].replace(/\D/g, ''));
        const progress = total ? Math.max(0, Math.min(100, Math.round((frame / total) * 100))) : 0;
        onProgress?.({ status: 'rendering', phase: 'encoding', progress, frame });
        stderr = stderr.slice(-4000);
      }
    });
    activeProcess.on('error', err => { activeProcess = null; reject(err); });
    activeProcess.on('close', code => {
      const wasCancelled = code === null;
      activeProcess = null;
      if (wasCancelled) return reject(new Error('Render cancelled.'));
      if (code !== 0) return reject(new Error(stderr.trim() || `FFmpeg exited with code ${code}`));
      onProgress?.({ status: 'complete', phase: 'encoding', progress: 100 });
      resolve({ outputPath });
    });
  });
}

function cancelRender() {
  if (!activeProcess) return false;
  activeProcess.kill('SIGTERM');
  return true;
}

module.exports = { renderSequence, cancelRender, buildArgs };
