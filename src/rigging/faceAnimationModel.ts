export type FaceAnimationValues = {
  leftBlink:number; rightBlink:number; gazeX:number; gazeY:number;
  leftBrow:number; rightBrow:number; mouthOpen:number; smile:number;
};

export const defaultFaceAnimation:FaceAnimationValues={leftBlink:0,rightBlink:0,gazeX:0,gazeY:0,leftBrow:0,rightBrow:0,mouthOpen:0,smile:0};

export function clampFace(v:number){return Math.max(-100,Math.min(100,v));}

export function faceValuesFromKeyframes(keyframes:Array<{property:string;value:unknown}>):FaceAnimationValues{
 const out={...defaultFaceAnimation};
 for(const k of keyframes){if(k.property in out&&typeof k.value==='number')out[k.property as keyof FaceAnimationValues]=clampFace(k.value)}
 return out;
}

export {faceValuesAtFrame} from '../animation/faceTrack';
