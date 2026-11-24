# Open-source animation engineering research

Research date: 2026-11-24

This document records architecture and feature ideas reviewed from public animation projects. It is a design reference for an original MAYA SHADOW ANIMATION STUDIO implementation. It is **not** a code-copy plan.

## Projects reviewed

| Project | Useful areas reviewed | License signal | How we use the research |
|---|---|---|---|
| [OpenBone](https://github.com/UXCentury/open-bone) | Weighted mesh editing, constraints and deterministic constraint ordering, deform keys, animation timeline, conformance fixtures | Repository declares MIT | Strongest reference for a modern skeletal-animation architecture. Prefer independent implementation; any future direct reuse requires preserving MIT notices and reviewing dependency licenses. |
| [Synfig Studio](https://github.com/synfig/synfig) | Bone influence value nodes, skeleton deformation layer, mesh transform and bone-deform UI concepts | GPL-3.0 | Study behavior and user workflows only. Do not copy its source into this project unless the product's distribution and licensing strategy is deliberately changed after legal review. |
| [OSATURA](https://github.com/chiuta/osatura) | Parent-first bone hierarchy, local pose deltas, FABRIK, soft/stretch IK, angle limits, pin/aim/copy-rotation constraints, skinning and deformers | Mixed licensing: source files carry SPDX identifiers; docs include CC-BY-4.0 and other assets have separate terms | Learn the architecture and test cases. Check the exact file's SPDX license before any reuse; do not copy documentation or assets without meeting their separate terms. |
| [Fanimate](https://github.com/toonittmedia/fanimate) | Smart Bones, IK, vector puppets, X-sheet/frame-by-frame workflow, editor panel separation | Repository includes Apache-2.0 and MIT license texts; confirm which applies to each file before reuse | Useful workflow reference for Moho-like character animation. Implement independently unless file-level license and attribution obligations are verified. |
| [OpenToonz](https://github.com/opentoonz/opentoonz) | Traditional 2D production workflow, X-sheet and drawing/cleanup pipeline | GitHub API did not provide a reliable SPDX identifier in this review | Workflow reference only until exact license terms are checked. |

## Engineering lessons to adopt

### 1. Make rig evaluation a deterministic pipeline

Target order for each frame:

1. Resolve and validate the parent-first bone hierarchy.
2. Build the rest-pose transforms.
3. Apply local animation deltas (rotation, translation and scale).
4. Evaluate FK world transforms.
5. Solve IK chains (analytic two-bone solver; FABRIK for longer chains).
6. Apply explicitly ordered constraints (aim, copy-rotation, pin, transform/path).
7. Advance optional physics with a stable timestep.
8. Deform weighted meshes and vector geometry.
9. Render attachments and overlays.

The order must be visible in diagnostics. A bone inspector should explain which animation channels, IK chains and constraints contributed to its final transform.

### 2. Improve IK beyond a basic target solver

- Keep bend direction explicit for two-bone chains.
- Add FABRIK for chains with three or more segments.
- Add soft IK to reduce sudden elbow/knee popping near full extension.
- Add optional stretch with a user-controlled maximum.
- Support FK/IK mixing as an animatable property, not only a viewport slider.
- Test reachable and unreachable targets, zero-length segments, mirrored limbs and angle limits.

### 3. Treat mesh editing and weight painting as separate tools

- Store a real mesh: vertices, UV coordinates, triangles and outline/hull.
- Store per-vertex bone influences; normalize valid weights and reject invalid bone references.
- Edit mesh geometry in setup pose. Keep UVs, triangles, weights and animation deform keys consistent when vertices are added, moved or removed.
- Paint weights with selectable falloff, add/erase, smoothing, normalization, mirror and per-bone reset.
- Keep a clear heatmap legend and selected-bone influence display.
- Add free-form deformation keys so an animator can reshape a mesh at a selected frame.
- Cache setup-pose vertex positions by document revision; invalidate cache after relevant edits.

### 4. Upgrade constraints and diagnostics

Use a common constraint model with:
- stable ID, enabled state, order and mix/weight;
- type-specific inputs and validation;
- deterministic evaluation order;
- angle limits and parent/target validation;
- an explanation panel showing the final transform contribution chain.

Do not hide constraint order in implicit component order.

### 5. Timeline and animation data

- Animate individual properties (bone transform, constraint mix, mesh deformation, visibility, opacity, colour and audio events).
- Keep interpolation modes and Bezier handles per key/segment.
- Support hold/stepped keys, copy/paste, retiming, multi-select and onion skin.
- Keep audio waveform display tied to actual clip start/end/trim and timeline position.
- Preserve a clear distinction between a pose snapshot and editable per-property animation channels.

### 6. Automated conformance tests

Create small, deterministic rig fixtures and expected numeric results for:
- parent-child FK and reparenting without rest-pose drift;
- two-bone IK, FABRIK, soft IK and stretch;
- constraint order and mix values;
- angle limits;
- mesh deformation with one and multiple influences;
- weight normalization, smoothing and mirror;
- mesh topology edits preserving UVs, weights and deform keys;
- save/reopen round-trips and render output consistency.

A feature is not complete merely because its controls appear in the UI. It needs behavior tests and a reproducible example project.

## Prioritized MAYA SHADOW implementation plan

1. **Rig foundation:** parent-local transforms, stable rest pose, validated hierarchy, transform inspector and deterministic FK.
2. **IK engine:** robust two-bone IK, FABRIK, bend direction, soft/stretch options and FK/IK mix.
3. **Skinning:** real per-vertex influences, setup-pose mesh binding, heatmap, paint/erase, smooth, normalize, mirror and reset.
4. **Deformers:** mesh vertex editing, triangulation, cage/lattice/spine/pin tools and keyed free-form deformation.
5. **Constraint stack:** aim, copy rotation, pin, transform limits, order and diagnostics.
6. **Animation workflow:** per-property channels, graph editor, deform keys, onion skin, audio events and X-sheet.
7. **Production reliability:** undo/redo transactions, autosave/recovery, project validation, conformance fixtures and render regression tests.

## License and provenance policy

- Prefer original implementations based on documented behavior and general engineering principles.
- Do not copy GPL-3.0 Synfig source into this repository without an explicit licensing decision and legal review.
- For MIT or Apache-2.0 code, verify the exact file, dependencies, notices, attribution and redistribution obligations before any direct reuse.
- OSATURA and OpenToonz require file-level license checks; a repository-level badge or missing SPDX value is not sufficient.
- Never copy proprietary Moho code, assets, branding or protected UI artwork.
- Record any future third-party code, version, source URL, file path, license and required notices in a separate third-party notices file.

## Primary source links

- https://github.com/UXCentury/open-bone
- https://github.com/synfig/synfig
- https://github.com/chiuta/osatura
- https://github.com/toonittmedia/fanimate
- https://github.com/opentoonz/opentoonz
