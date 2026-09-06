import {FaceAnimationValues,defaultFaceAnimation,clampFace} from '../rigging/faceAnimationModel';
export function faceValuesAtFrame(keyframes:Array<{frame:number;property:string;value:unknown}>,frame:number):FaceAnimationValues{
 const out={...defaultFaceAnimation};
 (Object.keys(out) as Array<keyof FaceAnimationValues>).forEach(property=>{
  const keys=keyframes.filter(k=>k.property===property&&typeof k.value==='number').sort((a,b)=>a.frame-b.frame);
  if(!keys.length)return;
  const before=[...keys].reverse().find(k=>k.frame<=frame),after=keys.find(k=>k.frame>=frame);
  if(!before)out[property]=clampFace(Number(after!.value)); else if(!after)out[property]=clampFace(Number(before.value)); else if(before.frame===after.frame)out[property]=clampFace(Number(before.value)); else {const t=(frame-before.frame)/(after.frame-before.frame);out[property]=clampFace(Number(before.value)+(Number(after.value)-Number(before.value))*t)}
 });return out;
}
