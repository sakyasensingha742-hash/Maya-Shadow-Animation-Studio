export type RigPartId =
  | 'head' | 'neck' | 'spine' | 'pelvis'
  | 'leftUpperArm' | 'leftLowerArm' | 'leftHand'
  | 'rightUpperArm' | 'rightLowerArm' | 'rightHand'
  | 'leftUpperLeg' | 'leftLowerLeg' | 'leftFoot'
  | 'rightUpperLeg' | 'rightLowerLeg' | 'rightFoot'
  | 'leftEye' | 'rightEye' | 'leftIris' | 'rightIris'
  | 'leftPupil' | 'rightPupil' | 'leftUpperLid' | 'rightUpperLid'
  | 'leftLowerLid' | 'rightLowerLid' | 'leftBrow' | 'rightBrow'
  | 'mouth' | 'hair';

export type RigMapPoint = {
  id: RigPartId;
  label: string;
  x: number;
  y: number;
  enabled: boolean;
  confidence?: number;
};

export type RigMap = {
  version: 1;
  imageWidth: number;
  imageHeight: number;
  points: RigMapPoint[];
  symmetry: boolean;
};

export const DEFAULT_RIG_PARTS: Array<{ id: RigPartId; label: string }> = [
  { id: 'head', label: 'Head' }, { id: 'neck', label: 'Neck' },
  { id: 'spine', label: 'Spine' }, { id: 'pelvis', label: 'Pelvis' },
  { id: 'leftUpperArm', label: 'L Upper Arm' }, { id: 'leftLowerArm', label: 'L Lower Arm' }, { id: 'leftHand', label: 'L Hand' },
  { id: 'rightUpperArm', label: 'R Upper Arm' }, { id: 'rightLowerArm', label: 'R Lower Arm' }, { id: 'rightHand', label: 'R Hand' },
  { id: 'leftUpperLeg', label: 'L Upper Leg' }, { id: 'leftLowerLeg', label: 'L Lower Leg' }, { id: 'leftFoot', label: 'L Foot' },
  { id: 'rightUpperLeg', label: 'R Upper Leg' }, { id: 'rightLowerLeg', label: 'R Lower Leg' }, { id: 'rightFoot', label: 'R Foot' },
  { id: 'leftEye', label: 'L Eye White' }, { id: 'rightEye', label: 'R Eye White' },
  { id: 'leftIris', label: 'L Iris' }, { id: 'rightIris', label: 'R Iris' },
  { id: 'leftPupil', label: 'L Pupil' }, { id: 'rightPupil', label: 'R Pupil' },
  { id: 'leftUpperLid', label: 'L Upper Lid' }, { id: 'rightUpperLid', label: 'R Upper Lid' },
  { id: 'leftLowerLid', label: 'L Lower Lid' }, { id: 'rightLowerLid', label: 'R Lower Lid' },
  { id: 'leftBrow', label: 'L Brow' }, { id: 'rightBrow', label: 'R Brow' },
  { id: 'mouth', label: 'Mouth' }, { id: 'hair', label: 'Hair' },
];

export function createEmptyRigMap(width = 1920, height = 1080): RigMap {
  return {
    version: 1,
    imageWidth: width,
    imageHeight: height,
    symmetry: true,
    points: DEFAULT_RIG_PARTS.map((part) => ({ ...part, x: width / 2, y: height / 2, enabled: false })),
  };
}
