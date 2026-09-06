export type LayerKind='vector'|'image'|'character'|'audio'|'video'|'background';
export type Keyframe={frame:number;value:number|string|boolean};
export type TimelineTrack={id:string;name:string;kind:'camera'|'character'|'audio'|'background'|'property';keyframes:Keyframe[]};
export type Scene={id:string;name:string;width:number;height:number;fps:number;duration:number;tracks:TimelineTrack[]};
export type Project={version:1;name:string;scenes:Scene[];activeSceneId:string;createdAt:string;updatedAt:string};
export const createScene=(name='Scene 01'):Scene=>({id:crypto.randomUUID(),name,width:1920,height:1080,fps:24,duration:240,tracks:[{id:crypto.randomUUID(),name:'Camera',kind:'camera',keyframes:[]},{id:crypto.randomUUID(),name:'Character',kind:'character',keyframes:[]},{id:crypto.randomUUID(),name:'Audio',kind:'audio',keyframes:[]},{id:crypto.randomUUID(),name:'Background',kind:'background',keyframes:[]}]});
export const createProject=():Project=>{const scene=createScene();return{version:1,name:'Untitled Project',scenes:[scene],activeSceneId:scene.id,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}};
export function upsertKeyframe(track:TimelineTrack,frame:number,value:number|string|boolean):TimelineTrack{return{...track,keyframes:[...track.keyframes.filter(k=>k.frame!==frame),{frame,value}].sort((a,b)=>a.frame-b.frame)}};
