# Character Rigging System

The rigging pipeline is designed as:

**Character Image → Rig Map → AI Detect → Manual Correction → 1-Click Rig**

## Mapping model

The map stores normalized-independent canvas coordinates for body and facial controls. Facial mapping is intentionally multi-part: eye white, iris, pupil, upper/lower eyelids and eyebrows are separate controls.

## Planned next modules

- Canvas marker dragging and snapping
- Symmetry-aware mapping
- Image segmentation/keypoint inference adapter
- Bone hierarchy generation
- Mesh/deformer generation
- IK controls for arms and legs
- Eye gaze, blink and eyelid deformation
- Mouth phoneme/viseme library
- Rig preview and reusable rig templates
