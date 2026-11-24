# Lip-sync interoperability

## Rhubarb Lip Sync cue import

Maya Shadow Animation Studio can import Rhubarb Lip Sync cue exports in JSON, XML and TSV formats. Imported cues are placed on the Face track at the current playhead frame, converted using the active scene FPS, and represented by both:

- a `mouthCue` keyframe retaining the original Rhubarb shape code (A–H or X); and
- a `mouthOpen` keyframe providing an approximate opening value for the studio's generic facial preview control.

The original cue letter is retained so character-specific switch-mouth and viseme rigs can map the exact shape. Generic mouth-opening values are only preview approximations, not phoneme-to-viseme recognition.

### Scope and limitations

This feature imports cue data created by Rhubarb; it does not include or run the Rhubarb audio-analysis executable. Generate a cue file from a voice recording in Rhubarb, then choose **Face Rig → Import Rhubarb Lip Sync**. JSON, XML and TSV output are supported. The import begins at the current frame and extends the scene duration when necessary.

Rhubarb Lip Sync is a separate MIT-licensed project: https://github.com/DanielSWolf/rhubarb-lip-sync. No Rhubarb source code or executable is bundled here; this integration reads its documented output format. Rigby2D was reviewed as an MIT/Apache-2.0 reference for rigging, mesh and lip-sync architecture, but its code and branding are not copied into this feature.

## Audio-driven lip-sync using OpenBone

The Face Rig can also analyse an audio asset already imported into the Audio/Video workspace. Choose the recording in the Face Rig panel and press **Analyze selected audio → Lip Sync**. Audio is decoded locally through the browser's Web Audio API; a background worker runs OpenBone Core's six-shape spectral/loudness algorithm and returns timed mouth intervals. The result is written as discrete `mouthCue` and approximate `mouthOpen` keys on the existing Face track, beginning at the current playhead and using the active scene FPS.

### Important accuracy limit

This is audio-energy/spectral mouth animation using the six OpenBone shapes (rest, closed, small, open, wide, round). It does **not** transcribe speech, identify words, or recognise phonemes. For speech-specific cues use the Rhubarb JSON/XML/TSV import workflow. Analysis runs in a Web Worker so the editor UI stays responsive; each pass is limited to 30 minutes. The OpenBone MIT package is already listed in `THIRD_PARTY_NOTICES.md`.
