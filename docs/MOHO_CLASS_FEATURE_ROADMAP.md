# MAYA SHADOW ANIMATION STUDIO — Moho-Class Feature Roadmap

## Product direction

Build an original professional 2D animation application with comparable breadth to publicly documented Moho Pro workflows. This is a clean-room implementation: original source code, interface, assets, file formats, and interaction design. Do not copy Moho source code, proprietary assets, icons, branding, or exact screen layouts.

## Reference baseline

As checked on 24 November 2026, the latest official installer listing is Moho 14.5.1 (listed 16 November 2026). Treat its public feature categories as a moving reference, not a source-code or visual-design template.

References:
- https://moho.lostmarble.com/pages/features
- https://moho.lostmarble.com/blogs/news/moho-14-5-showtime-design-rig-and-animate-characters-live-all-the-power-of-moho-now-live
- https://moho.lostmarble.com/en/pages/download

## Feature parity workstreams

### A. Drawing and vector authoring
- [x] Basic brush presets and drawing canvas (early implementation)
- [x] Basic vector pen path creation and anchor/Bezier editing
- [ ] Production vector engine: stable topology, curves, shape/fill/stroke editing, variable-width strokes
- [ ] Freehand smoothing, point reduction, corner preservation, trim/dangling-tail cleanup
- [ ] Blob brush, eraser, delete-edge, shape selection and multi-stroke fill
- [ ] Paint Bucket modes: vector fill, trace fill, recolor
- [ ] Brush categories, custom brush library, line boil and color drift
- [ ] Vector effects: masks, gradients, blur, shadow, noise, opacity and blend modes

### B. Character rigging and deformation
- [x] Basic rig map, bone hierarchy and two-bone IK utility
- [x] Smart Bone driver data model and editor
- [x] Basic weighted mesh generation and CPU deformation preview
- [x] Weight normalization, radial weight paint utility and mirror-weight utility
- [ ] Integrate weight painting and symmetry into a visible interactive mesh editor
- [ ] Production FK/IK controls, target bones, pin bones, constraints and bone limits
- [ ] Smart Bone Actions with keyed controller-to-action evaluation and undoable editing
- [ ] Vitruvian bone/drawing replacement system
- [ ] Squash/stretch, bone dynamics, delayed constraints and follow-through
- [ ] Curvers/compressible curves with multi-curve layer support and rig binding
- [ ] Quad meshes, mesh editing, pinning, smart warp and robust image/vector skinning
- [ ] Rig templates, reusable skeletons, copy/relative-paste animation between rigs

### C. Animation and timeline
- [x] Timeline ruler, playhead scrubbing, zoom and playback range
- [x] Basic frame-by-frame exposure cells and hold/clear cel actions
- [x] Basic pose keyframe data and interpolation helpers
- [ ] Full channel-based timeline, keyframe selection/move/scale/copy/paste
- [ ] Graph editor with Bezier handles and channel filtering
- [ ] Interpolation library: step, smooth, ease, bounce, elastic, cycle and additive
- [ ] Freeze keys, push frames, reset pose, consolidate channels, frame-zero workflow
- [ ] Magnetic onion skin, past/future opacity/color, shift-and-trace
- [ ] Actions/action timeline, reusable cycles and nested animation
- [ ] Walk-cycle generator and animation retargeting

### D. Layers, scenes and compositing
- [x] Layer tree with groups, visibility, lock, reorder, duplicate and basic layer types
- [ ] Complete layer types: vector, image, image sequence, audio, video, switch, bone, group, particle, 3D, reference
- [ ] Layer filters including animated-only, multi-selection and robust hierarchy operations
- [ ] Masks, deep masking, blend modes, layer effects and compositing
- [ ] 3D layer transforms, multiplane scene, camera, depth shift and depth of field
- [ ] Reference layers and linked external asset refresh

### E. Audio, lip sync and live animation
- [x] Basic audio asset waveform display
- [x] Basic face control preview and switch-layer foundations
- [ ] Clip-aware audio tracks, trimming, gain, fades, sync and waveform caching
- [ ] Phoneme/viseme lip-sync generation and editable mouth-switch timeline
- [ ] Face tracking to facial bones, Smart Bone actions and facial mesh
- [ ] Live playback input architecture: webcam, gamepad, face tracking, physics
- [ ] Virtual webcam/stream output and recording integration

### F. Physics, particles and dynamics
- [ ] 2D physics: gravity, collision, joints and deterministic playback
- [ ] Particle emitters, presets, forces and render integration
- [ ] Bone dynamics for rotation, scale and translation
- [ ] Wind strength, direction and turbulence
- [ ] Liquid shape boolean/merge/intersect/blend and masking

### G. Import, export and production
- [ ] Layered PSD import with layer preservation and update/relink workflow
- [ ] SVG import/export with layers, gradients, masks and robust path handling
- [ ] Image sequence, video, audio and 3D interchange
- [ ] MP4/H.264, PNG sequence, EXR, alpha and color-profile export
- [ ] Batch exporter with per-job status, retry and presets
- [ ] Game engine/3D interchange export (documented, tested formats)
- [ ] Project packaging, missing-asset relink, autosave, crash recovery and version migration

### H. Extensibility and reliability
- [ ] Public plugin/tool API and scripting environment
- [ ] Custom keyboard shortcuts and workspace layouts
- [ ] Undo/redo command architecture across all editors
- [ ] GPU accelerated viewport and render parity
- [ ] Performance profiling, large-scene stress tests and memory budgets
- [ ] Cross-platform packaging and signed Windows release

## Delivery rules
1. Implement one coherent vertical slice at a time; avoid disconnected placeholder controls.
2. Every visible control must perform a real action or be clearly marked unavailable.
3. Add unit/contract tests for core math, serialization, import/export and timeline operations.
4. Run TypeScript, web build, desktop build, installer and smoke-test workflows before declaring a feature release-ready.
5. Preserve backward compatibility for existing Maya Shadow project files; version all serialized formats.
6. Treat native .moho project compatibility as out of scope unless a lawful, documented interchange specification is available.

## Current focus

Rigging vertical slice: make Smart Bone Actions, IK/FK, weight painting, mesh preview and pose evaluation work together end-to-end before expanding into the next production areas.
