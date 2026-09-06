import {CharacterRig,RigBone} from '../rigging/rigEngine';

export type BonePose = {rotation:number};
export type PosedBone = RigBone & {px:number;py:number;worldRotation:number};

const rad=(deg:number)=>deg*Math.PI/180;

export function poseRig(rig:CharacterRig,poses:Record<string,BonePose>={}):PosedBone[]{
  const byId=new Map<string,PosedBone>();
  const resolve=(bone:RigBone):PosedBone=>{
    const existing=byId.get(bone.id);if(existing)return existing;
    const parent=bone.parentId?byId.get(bone.parentId):undefined;
    const local=poses[bone.id]?.rotation??bone.rotation;
    const worldRotation=parent?parent.worldRotation+local:local;
    const px=parent?parent.x:bone.x;
    const py=parent?parent.y:bone.y;
    const x=parent?px+Math.cos(parent.worldRotation)*parent.length:bone.x;
    const y=parent?py+Math.sin(parent.worldRotation)*parent.length:bone.y;
    const posed={...bone,px,py,x,y,rotation:local,worldRotation};
    byId.set(bone.id,posed);return posed;
  };
  rig.bones.forEach(resolve);
  return rig.bones.map(b=>byId.get(b.id)!);
}

export function degrees(r:number){return Math.round((r*180)/Math.PI*10)/10;}
export function normalizeAngle(r:number){while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;return r;}
export function angleTo(a:{x:number;y:number},b:{x:number;y:number}){return Math.atan2(b.y-a.y,b.x-a.x);}
export function rotateLocalFromWorld(parentWorld:number,world:number){return normalizeAngle(world-parentWorld);}
export function percentToRadians(v:number,range=45){return rad(Math.max(-100,Math.min(100,v))*range/100);}
