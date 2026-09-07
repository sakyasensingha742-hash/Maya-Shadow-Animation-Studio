export type MotionFormat='mixamo-fbx'|'gltf'|'glb'|'bvh'|'vrm'|'motion-json';
export type MotionTarget='2d-bone-rig'|'2.5d-bone-rig'|'3d-character';
export type MotionClip={id:string;name:string;format:MotionFormat;duration:number;fps:number;source?:string;tags:string[]};
export type RetargetProfile={name:string;sourceBones:string[];targetBones:string[];scale:number;mirror:boolean;rootMotion:boolean};
export const defaultRetargetProfile:RetargetProfile={name:'Mixamo → 2D Character',sourceBones:['Hips','Spine','Spine1','Neck','Head','LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot'],targetBones:['root','spine','chest','neck','head','shoulder.L','arm.L','forearm.L','hand.L','shoulder.R','arm.R','forearm.R','hand.R','thigh.L','shin.L','foot.L','thigh.R','shin.R','foot.R'],scale:1,mirror:false,rootMotion:true};
export const motionFormatLabels:Record<MotionFormat,string>={'mixamo-fbx':'Mixamo FBX','gltf':'glTF','glb':'GLB','bvh':'BVH Motion Capture','vrm':'VRM','motion-json':'Maya Shadow Motion JSON'};
export function canRetargetTo2D(format:MotionFormat){return ['mixamo-fbx','gltf','glb','bvh','vrm','motion-json'].includes(format)}
export function makeMotionClip(name:string,format:MotionFormat,source?:string):MotionClip{return{id:`motion-${Date.now()}`,name,format,duration:0,fps:30,source,tags:['motion','retarget',format]}}
export function describeRetarget(clip:MotionClip,target:MotionTarget){return `${motionFormatLabels[clip.format]} → ${target} • auto bone mapping • timing preserved`}
