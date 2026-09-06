import {CharacterRig} from '../rigging/rigEngine';
import {BonePose,normalizeAngle} from './bonePose';

export type RigPose = Record<string,BonePose>;
export type RigPoseKeyframe = {frame:number;pose:RigPose};

export function poseFromRig(rig:CharacterRig):RigPose{
  return Object.fromEntries(rig.bones.map(b=>[b.id,{rotation:b.rotation}]));
}

export function interpolatePose(keys:RigPoseKeyframe[],frame:number):RigPose{
  if(!keys.length)return {};
  const sorted=[...keys].sort((a,b)=>a.frame-b.frame);
  const before=[...sorted].reverse().find(k=>k.frame<=frame);
  const after=sorted.find(k=>k.frame>=frame);
  if(!before)return after!.pose;
  if(!after)return before.pose;
  if(before.frame===after.frame)return before.pose;
  const t=(frame-before.frame)/(after.frame-before.frame);
  const ids=new Set([...Object.keys(before.pose),...Object.keys(after.pose)]);
  return Object.fromEntries([...ids].map(id=>{
    const a=before.pose[id]?.rotation??0;
    const b=after.pose[id]?.rotation??a;
    const delta=normalizeAngle(b-a);
    return [id,{rotation:normalizeAngle(a+delta*t)}];
  }));
}

export function upsertPoseKeyframe(keys:RigPoseKeyframe[],frame:number,pose:RigPose):RigPoseKeyframe[]{
  return [...keys.filter(k=>k.frame!==frame),{frame,pose}].sort((a,b)=>a.frame-b.frame);
}
