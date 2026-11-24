# Open-source Animation Code Research & Integration Register

Last reviewed: 2026-11-24

This register records public repositories and codebases reviewed for MAYA SHADOW ANIMATION STUDIO. It distinguishes code that is actually integrated from research references and candidates requiring further compatibility review.

## Integration policy

- Prefer MIT, Apache-2.0, BSD-2/3-Clause, ISC and public-domain code when the component fits the current React + TypeScript + Electron architecture.
- Keep upstream copyright and license notices with copied or vendored code.
- GPL/LGPL and mixed-license projects are research references until the project's redistribution and linking implications are reviewed. Personal use does not automatically remove license obligations.
- Do not import proprietary assets, trademarks, UI artwork or non-code material without permission.
- Pin dependencies and run Windows build, typecheck, functional checks and export tests before calling an integration production-ready.
- Prefer a reusable engine/library over embedding a second full editor application.

## Sources reviewed

### Skeletal rigging, deformation and runtime

| Project | Relevant capabilities | License / maturity | Decision |
|---|---|---|---|
| [OpenBone](https://github.com/UXCentury/open-bone) | Bone hierarchy, weighted meshes, free-form deformation, IK, transform/path/physics constraints, skins, animation mixing, state machines, particles, audio commands, lip sync, Canvas/WebGL renderers, exporters and runtimes | MIT. Modular TypeScript packages. | **Integrated**: `@openbone/core`, `@openbone/runtime`, `@openbone/render-canvas` dependencies; runtime bridge added and current pose evaluation routed through OpenBone. Further work: mesh attachments, weights, path/physics constraints and native project import/export. |
| [Ankhimate](https://github.com/Ankhimate/editor) | Rust skeletal editor, bones, FK, arbitrary-length FABRIK IK, skins, meshes, weights and keyframes | MIT OR Apache-2.0; pre-alpha, export not finished | Research for setup/animate separation and deterministic rig core; not yet integrated. |
| [OSATURA](https://github.com/chiuta/osatura) | Rust vector rigging engine, IK, skinning, deformers, state machines, physics, CLI, WASM and export | Mixed/file-level licensing; core and individual files must be checked. Maturity tiers documented by project. | Research for deformer, state machine and file pipeline; no source copied pending file-level license review and Rust/WASM adapter assessment. |
| [Rigby2D](https://github.com/jaisurya-dev-art/rigby2d) | PSD auto-rigging, mesh animation, IK, physics, audio lip-sync, render/export, multiple runtimes | MIT OR Apache-2.0; check third-party notices and asset licenses | Strong candidate for PSD import, auto-rig and lip-sync workflows; inspect exact package boundaries before reuse. |
| [Fanimate](https://github.com/toonittmedia/fanimate) | Smart Bones, IK, vector puppets, X-sheet and lip-sync workflows | Repository includes MIT and Apache-2.0 license texts; file-level check required | Reference for Smart Bone UX and X-sheet; not yet integrated. |
| [DragonBones](https://github.com/DragonBones/DragonBonesJS) | 2D skeletal animation runtime, slots, skins, mesh and animation playback | Runtime/editor license boundaries must be checked per repository | Candidate for interchange/runtime study; not yet integrated. |

### Vector, drawing, shape animation and motion graphics

| Project | Relevant capabilities | License / maturity | Decision |
|---|---|---|---|
| [Graphite](https://github.com/GraphiteEditor/Graphite) | Vector/raster editor, node graph, nondestructive image processing, procedural graphics | MIT OR Apache-2.0 (unless a subpath says otherwise); alpha | Research for node-based compositing, vector geometry and procedural tools. |
| [AniCraft](https://github.com/coqui-software/AniCraft) | Rust vector animation, layers, keyframes, classic/shape tweens, onion skin, renderer, SVG/PNG/GIF/video export | Public repo describes clean-room implementation; verify current license and release maturity before code reuse | Research for tween model, deterministic renderer and FLA/XFL interoperability. |
| [LibreToon](https://github.com/alvillafm/LibreToon) | Frame-by-frame, vector/raster, bones, weights, puppet pins, motion tweens, lip-sync, clips, PSD/SVG import and video export | MIT for project code; third-party notices/assets separate. Experimental | Research for integrated 2D workflow and project recovery; code reuse only after checking file and dependency notices. |
| [Rivo](https://github.com/zin-ix/rivo) | SVG bone rigging, layer binding, mesh morphing, keyframes, mirror rig, JSON/SVG export | License must be verified from repository files before copying | Reference for SVG-layer binding and rig UX. |
| [flubber](https://github.com/veltman/flubber) | Smooth interpolation between arbitrary 2D shapes/SVG paths | MIT | Candidate for shape tweening and path morphs; not yet integrated. |
| [Inkscape](https://gitlab.com/inkscape/inkscape) | SVG vector paths, boolean geometry, bezier editing, SVG import/export | GPL-2.0-or-later; verify dependencies and integration model | Reference for vector editing behavior; no code copied. |
| [Synfig](https://github.com/synfig/synfig) | Vector/bitmap tweening, bones, deformation and compositing | GPL-3.0 | Research only; do not copy into the current distributable without a deliberate GPL compliance decision. |
| [OpenToonz](https://github.com/opentoonz/opentoonz) | Production 2D pipeline, Xsheet, scanning, ink/paint, node compositing, audio sync, effects SDK | BSD-3-Clause for project code; third-party components separate | Strong reference for production pipeline and compositing architecture. |
| [Tahoma2D](https://github.com/tahoma2d/tahoma2d) | OpenToonz-derived 2D and stop-motion workflow | Modified BSD for files outside third-party/brush directories; mixed inside | Reference for production UX and stop-motion; check every source directory. |
| [Krita](https://github.com/KDE/krita) | Pressure-sensitive brush engine, raster painting, frame-by-frame animation, layers and masks | GPL-3.0 | Reference for brush/pressure and painting behavior; no direct code copied. |
| [Pencil2D](https://github.com/pencil2d/pencil) | Lightweight raster/vector frame-by-frame animation | GPL-2.0 | Reference for simple drawing and exposure-sheet workflow. |

### Audio, lip sync and production utilities

| Project | Relevant capabilities | License / decision |
|---|---|---|
| [Papagayo-NG](https://github.com/morevnaproject-org/papagayo-ng) | Phoneme alignment against recorded speech waveform | Verify repository license and dependencies before reuse; reference for manual phoneme timing. |
| [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync) | Automatic mouth-cue extraction from audio | MIT; cue-file interoperability implemented for JSON/XML/TSV. The recognizer executable is not bundled. |
| [FFmpeg](https://github.com/FFmpeg/FFmpeg) | Audio/video decode, encode, mux, filters and export | LGPL/GPL build configuration varies; current app already uses ffmpeg-static. Verify the exact binary build configuration and notices. |

## Code integrated in this update

### Rigby2D segment-aware automatic skin weights

- Updated `src/animation/meshDeformer.ts` with segment-distance weighting adapted from `Rigby2D/src/core/meshgeom.js`.
- Each mesh vertex is weighted by inverse fourth-power distance to each bone segment (from parent endpoint to child endpoint), then pruned to up to four influences and normalized.
- The existing brush painting, smoothing and CPU deformation preview continue using the same `Record<string, number>` weight representation.
- Added the upstream attribution and MIT notice to `THIRD_PARTY_NOTICES.md`.
- This is automatic skin-weight generation for the existing regular grid mesh; it is not Rigby2D's alpha-traced triangular mesh generation or its full PSD AutoRig.

### Rhubarb Lip Sync cue-file interoperability

- Added `src/animation/rhubarbLipSync.ts` for importing Rhubarb JSON, XML and TSV cue exports.
- The Face Rig imports timed mouth cues as `mouthCue` and approximate `mouthOpen` keyframes; the original shape code is preserved.
- No Rhubarb executable or audio recognizer is bundled; the feature imports cue files produced by that tool.

### OpenBone runtime adoption

- Added `@openbone/core@^0.4.11`.
- Added `@openbone/runtime@^0.4.11`.
- Added `@openbone/render-canvas@^0.4.11`.
- Added `src/animation/openBoneBridge.ts`, converting Maya Shadow's Y-down/radian rig representation to OpenBone's Y-up/degree document model and applying poses to the OpenBone runtime.
- Updated `src/animation/bonePose.ts` so world-space character pose evaluation uses OpenBone's runtime bone transforms, while preserving the existing PosedBone interface for the app.
- The bridge currently handles rig hierarchy and transforms. It does not yet convert Maya Shadow mesh weights, image attachments, Smart Bone drivers or bone constraints into OpenBone documents. Those are explicit next integration tasks.

## Next implementation order

1. Build conformance tests for the Maya Shadow ↔ OpenBone coordinate/pose bridge (root, parent-child, left/right, rotated parent, zero-length bone, limits).
2. Connect weighted mesh attachments and deformations to OpenBone runtime draw-list output; compare against the current CPU mesh preview.
3. Add path constraints and deterministic physics secondary motion for hair, cloth and tails.
4. Add audio-driven lip-sync analysis (OpenBone spectral algorithm or Rhubarb executable) and Papagayo-style manual phoneme alignment.
5. Improve SVG path/shape tweening with a vetted MIT morphing library such as flubber.
6. Use Graphite/OpenToonz/Tahoma2D research for non-destructive compositing and production pipeline design.
7. Continue package/file-level review of Rigby2D AutoRig/alpha mesh generation, ag-psd layered PSD import, Ankhimate, OSATURA and LibreToon.

## Upstream references

- OpenBone core README: https://github.com/UXCentury/open-bone/tree/main/packages/core
- OpenBone runtime README: https://github.com/UXCentury/open-bone/tree/main/packages/runtime
- OpenBone Canvas renderer README: https://github.com/UXCentury/open-bone/tree/main/packages/render-canvas
- OSATURA limitations and license notes: https://github.com/chiuta/osatura
- Rigby2D license and third-party notices: https://github.com/jaisurya-dev-art/rigby2d
- Graphite license: https://github.com/GraphiteEditor/Graphite
