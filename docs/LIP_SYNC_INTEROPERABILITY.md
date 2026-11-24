# Lip-sync interoperability

## Rhubarb Lip Sync cue import

Maya Shadow Animation Studio can import Rhubarb Lip Sync cue exports in JSON, XML and TSV formats. Imported cues are placed on the Face track at the current playhead frame, converted using the active scene FPS, and represented by both:

- a `mouthCue` keyframe retaining the original Rhubarb shape code (A–H or X); and
- a `mouthOpen` keyframe providing an approximate opening value for the studio's generic facial preview control.

The original cue letter is retained so character-specific switch-mouth and viseme rigs can map the exact shape. Generic mouth-opening values are only preview approximations, not phoneme-to-viseme recognition.

### Scope and limitations

This feature imports cue data created by Rhubarb; it does not include or run the Rhubarb audio-analysis executable. Generate a cue file from a voice recording in Rhubarb, then choose **Face Rig → Import Rhubarb Lip Sync**. JSON, XML and TSV output are supported. The import begins at the current frame and extends the scene duration when necessary.

Rhubarb Lip Sync is a separate MIT-licensed project: https://github.com/DanielSWolf/rhubarb-lip-sync. No Rhubarb source code or executable is bundled here; this integration reads its documented output format. Rigby2D was reviewed as an MIT/Apache-2.0 reference for rigging, mesh and lip-sync architecture, but its code and branding are not copied into this feature.
