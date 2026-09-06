export const FACE_LAYER_ORDER=['Sclera','Iris','Pupil','Upper Eyelid','Lower Eyelid','Eyelash','Eye Highlight','Eyebrow','Mouth'];
export type FaceRigState={blinkL:number;blinkR:number;gazeX:number;gazeY:number;browL:number;browR:number;mouthOpen:number;smile:number};
export const defaultFaceRigState:FaceRigState={blinkL:0,blinkR:0,gazeX:0,gazeY:0,browL:0,browR:0,mouthOpen:0,smile:0};
