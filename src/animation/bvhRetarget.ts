import {BvhChannel,BvhJoint,BvhMotion,flattenBvhJoints} from './bvhMotion';
import {RigPose} from './poseTrack';

const TARGETS:Record<string,string>={
 hips:'root',pelvis:'root',spine:'spine',spine1:'spine',spine2:'spine',chest:'spine',neck:'neck',head:'head',
 leftshoulder:'upperArmL',leftarm:'upperArmL',leftforearm:'lowerArmL',leftelbow:'lowerArmL',lefthand:'handL',
 rightshoulder:'upperArmR',rightarm:'upperArmR',rightforearm:'lowerArmR',rightelbow:'lowerArmR',righthand:'handR',
 leftupleg:'upperLegL',leftthigh:'upperLegL',leftleg:'lowerLegL',leftshin:'lowerLegL',leftfoot:'footL',
 rightupleg:'upperLegR',rightthigh:'upperLegR',rightleg:'lowerLegR',rightshin:'lowerLegR',rightfoot:'footR'
};
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const targetFor=(name:string)=>TARGETS[norm(name)];

type JointChannels={joint:BvhJoint;start:number};
function channelsFor(root:BvhJoint){const out:JointChannels[]=[];let cursor=0;const walk=(j:BvhJoint)=>{out.push({joint:j,start:cursor});cursor+=j.channels.length;j.children.forEach(walk)};walk(root);return out;}
function channelValue(frame:number[],info:JointChannels,channel:BvhChannel){const i=info.joint.channels.indexOf(channel);return i<0?0:frame[info.start+i]??0;}

/** Convert BVH joint rotations into Maya Shadow's existing 2D/2.5D rig pose format. */
export function bvhToRigPoses(motion:BvhMotion,scale=1,mirror=false):Array<{frame:number;pose:RigPose}>{
 const infos=channelsFor(motion.root);const out:Array<{frame:number;pose:RigPose}>=[];
 for(let f=0;f<motion.frames.length;f++){
  const pose:RigPose={};
  for(const info of infos){const target=targetFor(info.joint.name);if(!target)continue;
   const z=channelValue(motion.frames[f],info,'Zrotation');const y=channelValue(motion.frames[f],info,'Yrotation');const x=channelValue(motion.frames[f],info,'Xrotation');
   let rotation=((Math.abs(z)>0.001?z:(Math.abs(y)>0.001?y:x))*Math.PI/180)*scale;
   if(mirror && (target.endsWith('L')||target.endsWith('R')))rotation=-rotation;
   pose[target]={rotation};
  }
  out.push({frame:Math.round(f*(24/motion.fps))+1,pose});
 }
 return out;
}

export function bvhRetargetSummary(motion:BvhMotion){const mapped=new Set<string>();for(const j of flattenBvhJoints(motion.root)){const t=targetFor(j.name);if(t)mapped.add(t)}return{frames:motion.frameCount,joints:flattenBvhJoints(motion.root).length,mappedBones:[...mapped]};}
