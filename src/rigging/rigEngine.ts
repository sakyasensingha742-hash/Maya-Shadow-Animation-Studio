export type RigBone = {
  id: string;
  parentId: string | null;
  sourcePointId: string;
  x: number;
  y: number;
  length: number;
  rotation: number;
};

export type FacialControl = {
  id: string;
  type: 'sclera' | 'iris' | 'pupil' | 'eyelid' | 'lash' | 'highlight' | 'brow' | 'mouth';
  side?: 'left' | 'right' | 'center';
  value: number;
};

export type BoneConstraint = { boneId: string; minRotation: number; maxRotation: number; enabled: boolean };

export type CharacterRig = {
  version: 1;
  bones: RigBone[];
  facialControls: FacialControl[];
  smartBoneDrivers?: SmartBoneDriver[];
  /** Per-vertex normalized bone influences for the 21x17 deformation grid. */
  meshWeights?: Record<string, number>[];
  /** Optional per-bone rotation limits, stored in radians. */
  boneConstraints?: BoneConstraint[];
  generatedAt: string;
};

export const DEFAULT_BONE_IDS = ['root','spine','neck','head','upperArmL','lowerArmL','handL','upperArmR','lowerArmR','handR','upperLegL','lowerLegL','footL','upperLegR','lowerLegR','footR'] as const;

type Point = {id:string;x:number;y:number};
type Spec = [string,string,string|null,string|null];

const specs: Spec[] = [
  ['root','pelvis',null,null], ['spine','spine','root','pelvis'], ['neck','neck','spine','spine'], ['head','head','neck','neck'],
  ['upperArmL','l-shoulder','neck','neck'], ['lowerArmL','l-elbow','upperArmL','l-shoulder'], ['handL','l-hand','lowerArmL','l-elbow'],
  ['upperArmR','r-shoulder','neck','neck'], ['lowerArmR','r-elbow','upperArmR','r-shoulder'], ['handR','r-hand','lowerArmR','r-elbow'],
  ['upperLegL','l-knee','root','pelvis'], ['lowerLegL','l-ankle','upperLegL','l-knee'], ['footL','l-toe','lowerLegL','l-ankle'],
  ['upperLegR','r-knee','root','pelvis'], ['lowerLegR','r-ankle','upperLegR','r-knee'], ['footR','r-toe','lowerLegR','r-ankle'],
];

export function buildRigFromMap(points: Point[]): CharacterRig {
  const map = new Map(points.map(p => [p.id, p]));
  const point = (id: string) => map.get(id) ?? {id, x:50, y:50};
  const bones = specs.map(([id, sourceId, parentId, parentPointId]) => {
    const p = point(sourceId), parent = parentPointId ? point(parentPointId) : p;
    const dx = p.x - parent.x, dy = p.y - parent.y;
    return {id, parentId, sourcePointId:sourceId, x:p.x, y:p.y, length:Math.hypot(dx,dy), rotation:Math.atan2(dy,dx)};
  });
  const facialControls: FacialControl[] = [
    {id:'sclera-left',type:'sclera',side:'left',value:1},{id:'iris-left',type:'iris',side:'left',value:0},{id:'pupil-left',type:'pupil',side:'left',value:0},
    {id:'upper-lid-left',type:'eyelid',side:'left',value:0},{id:'lower-lid-left',type:'eyelid',side:'left',value:0},{id:'lash-left',type:'lash',side:'left',value:1},{id:'highlight-left',type:'highlight',side:'left',value:1},{id:'brow-left',type:'brow',side:'left',value:0},
    {id:'sclera-right',type:'sclera',side:'right',value:1},{id:'iris-right',type:'iris',side:'right',value:0},{id:'pupil-right',type:'pupil',side:'right',value:0},
    {id:'upper-lid-right',type:'eyelid',side:'right',value:0},{id:'lower-lid-right',type:'eyelid',side:'right',value:0},{id:'lash-right',type:'lash',side:'right',value:1},{id:'highlight-right',type:'highlight',side:'right',value:1},{id:'brow-right',type:'brow',side:'right',value:0},
    {id:'mouth-open',type:'mouth',side:'center',value:0},{id:'mouth-smile',type:'mouth',side:'center',value:0},
  ];
  return {version:1,bones,facialControls,generatedAt:new Date().toISOString()};
}

export type IKPoint = { x: number; y: number };
export type TwoBoneIKResult = {
  root: IKPoint;
  joint: IKPoint;
  end: IKPoint;
  rootAngle: number;
  jointAngle: number;
  reachable: boolean;
};

/**
 * Solve a planar two-segment IK chain with the law of cosines.
 * Angles are radians, measured from +X; bendDirection selects the
 * positive (1) or negative (-1) side of the target vector.
 */
export function solveTwoBoneIK(
  root: IKPoint,
  target: IKPoint,
  upperLength: number,
  lowerLength: number,
  bendDirection: 1 | -1 = 1,
): TwoBoneIKResult {
  const a = Math.max(0.0001, Math.abs(upperLength));
  const b = Math.max(0.0001, Math.abs(lowerLength));
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const rawDistance = Math.hypot(dx, dy);
  const minReach = Math.abs(a - b) + 0.0001;
  const maxReach = Math.max(minReach, a + b - 0.0001);
  const distance = Math.min(maxReach, Math.max(minReach, rawDistance));
  const direction = rawDistance > 0.000001 ? Math.atan2(dy, dx) : 0;
  const cosine = Math.max(-1, Math.min(1, (a * a + distance * distance - b * b) / (2 * a * distance)));
  const offset = Math.acos(cosine) * bendDirection;
  const rootAngle = direction - offset;
  const joint = { x: root.x + Math.cos(rootAngle) * a, y: root.y + Math.sin(rootAngle) * a };
  const end = { x: joint.x + Math.cos(direction + offset) * b, y: joint.y + Math.sin(direction + offset) * b };
  return {
    root,
    joint,
    end,
    rootAngle,
    jointAngle: Math.atan2(end.y - joint.y, end.x - joint.x) - rootAngle,
    reachable: rawDistance >= minReach && rawDistance <= maxReach,
  };
}

/** Convert a solved world-space IK chain into local rotations for a RigBone pair. */
export function applyTwoBoneIK(
  upper: RigBone,
  lower: RigBone,
  target: IKPoint,
  bendDirection: 1 | -1 = 1,
): { upper: RigBone; lower: RigBone; solution: TwoBoneIKResult } {
  const solution = solveTwoBoneIK(
    { x: upper.x, y: upper.y },
    target,
    upper.length,
    lower.length,
    bendDirection,
  );
  return {
    upper: { ...upper, rotation: solution.rootAngle },
    lower: { ...lower, rotation: solution.rootAngle + solution.jointAngle },
    solution,
  };
}


/** A Smart Bone maps one controller's angular range to another bone's rotation offset. */
export type SmartBoneDriver = {
  id: string;
  inputBoneId: string;
  outputBoneId: string;
  inputStart: number;
  inputEnd: number;
  outputStart: number;
  outputEnd: number;
  easing: 'linear' | 'smooth';
  enabled: boolean;
};

export type RigPose = Record<string, number>;

/** Clamp pose rotations to enabled per-bone limits (radians). */
export function constrainRigPose(pose: RigPose, constraints: BoneConstraint[] = []): RigPose {
  if (!constraints.length) return { ...pose };
  const result = { ...pose };
  for (const constraint of constraints) {
    if (!constraint.enabled || !Number.isFinite(result[constraint.boneId])) continue;
    const low = Math.min(constraint.minRotation, constraint.maxRotation);
    const high = Math.max(constraint.minRotation, constraint.maxRotation);
    result[constraint.boneId] = Math.max(low, Math.min(high, result[constraint.boneId]));
  }
  return result;
}

const normalizeAngle = (angle: number) => {
  let value = angle;
  while (value > Math.PI) value -= Math.PI * 2;
  while (value < -Math.PI) value += Math.PI * 2;
  return value;
};

/** Blend FK and IK rotations using shortest-path angular interpolation. */
export function blendIKFKPoses(fk: RigPose, ik: RigPose, ikWeight: number): RigPose {
  const weight = Math.max(0, Math.min(1, Number.isFinite(ikWeight) ? ikWeight : 0));
  const ids = new Set([...Object.keys(fk), ...Object.keys(ik)]);
  const result: RigPose = {};
  ids.forEach(id => {
    const from = fk[id] ?? ik[id] ?? 0;
    const to = ik[id] ?? from;
    result[id] = normalizeAngle(from + normalizeAngle(to - from) * weight);
  });
  return result;
}

/** Evaluate one Smart Bone driver as a rotation offset for its output bone. */
export function evaluateSmartBoneDriver(driver: SmartBoneDriver, pose: RigPose): number {
  if (!driver.enabled) return 0;
  const input = pose[driver.inputBoneId] ?? 0;
  const span = driver.inputEnd - driver.inputStart;
  const raw = Math.abs(span) < 1e-8 ? (input >= driver.inputEnd ? 1 : 0)
    : Math.max(0, Math.min(1, (input - driver.inputStart) / span));
  const t = driver.easing === 'smooth' ? raw * raw * (3 - 2 * raw) : raw;
  return driver.outputStart + (driver.outputEnd - driver.outputStart) * t;
}

/** Apply all enabled Smart Bone drivers; multiple drivers add their offsets. */
export function applySmartBoneDrivers(pose: RigPose, drivers: SmartBoneDriver[]): RigPose {
  const result = { ...pose };
  for (const driver of drivers) {
    if (!driver.enabled) continue;
    result[driver.outputBoneId] = normalizeAngle(
      (result[driver.outputBoneId] ?? 0) + evaluateSmartBoneDriver(driver, pose),
    );
  }
  return result;
}


export type FABRIKResult = { joints: IKPoint[]; reachable: boolean; iterations: number; error: number };

/**
 * FABRIK solver for a chain with any number of segments.
 * Input joints describe the current pose; segment lengths are preserved.
 * Returns a fresh joint array and never mutates the caller's points.
 */
export function solveFABRIK(
  joints: IKPoint[],
  target: IKPoint,
  options: { iterations?: number; tolerance?: number } = {},
): FABRIKResult {
  const points = joints.map(p => ({ x: p.x, y: p.y }));
  const segmentCount = points.length - 1;
  if (segmentCount < 1) {
    const error = points[0] ? Math.hypot(points[0].x - target.x, points[0].y - target.y) : Infinity;
    return { joints: points, reachable: false, iterations: 0, error };
  }
  const lengths = points.slice(0, -1).map((p, i) =>
    Math.hypot(points[i + 1].x - p.x, points[i + 1].y - p.y),
  );
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  const root = { ...points[0] };
  const tolerance = Math.max(1e-5, options.tolerance ?? 0.25);
  const maxIterations = Math.max(1, Math.min(256, Math.floor(options.iterations ?? 32)));
  const distance = (a: IKPoint, b: IKPoint) => Math.hypot(b.x - a.x, b.y - a.y);
  const direction = (from: IKPoint, to: IKPoint): IKPoint => {
    const d = distance(from, to);
    return d > 1e-8 ? { x: (to.x - from.x) / d, y: (to.y - from.y) / d } : { x: 1, y: 0 };
  };
  const reachable = distance(root, target) <= totalLength + tolerance;
  if (!reachable) {
    const dir = direction(root, target);
    let cursor = root;
    points[0] = root;
    for (let i = 0; i < segmentCount; i++) {
      cursor = { x: cursor.x + dir.x * lengths[i], y: cursor.y + dir.y * lengths[i] };
      points[i + 1] = cursor;
    }
    const error = distance(points[segmentCount], target);
    return { joints: points, reachable, iterations: 1, error };
  }
  let error = distance(points[segmentCount], target);
  let used = 0;
  for (let pass = 0; pass < maxIterations && error > tolerance; pass++) {
    points[segmentCount] = { ...target };
    for (let i = segmentCount - 1; i >= 0; i--) {
      const dir = direction(points[i + 1], points[i]);
      points[i] = {
        x: points[i + 1].x + dir.x * lengths[i],
        y: points[i + 1].y + dir.y * lengths[i],
      };
    }
    points[0] = root;
    for (let i = 0; i < segmentCount; i++) {
      const dir = direction(points[i], points[i + 1]);
      points[i + 1] = {
        x: points[i].x + dir.x * lengths[i],
        y: points[i].y + dir.y * lengths[i],
      };
    }
    error = distance(points[segmentCount], target);
    used = pass + 1;
  }
  return { joints: points, reachable, iterations: used, error };
}

/** Soft-IK remapping: eases toward full chain reach to reduce sudden knee/elbow popping. */
export function softIKDistance(distance: number, reach: number, softness = 0): number {
  const safeReach = Math.max(0, reach);
  const safeDistance = Math.max(0, distance);
  const soft = Math.max(0, Math.min(0.9, softness));
  const zone = safeReach * soft;
  if (zone <= 1e-8 || safeDistance <= safeReach - zone) return Math.min(safeDistance, safeReach);
  const x = safeDistance - (safeReach - zone);
  return (safeReach - zone) + zone * (1 - Math.exp(-x / zone));
}
