export type LayerKind = 'scene' | 'character' | 'face' | 'rig' | 'background' | 'audio' | 'video' | 'drawing';
export type KeyframeValue = number | string | boolean | Record<string, number>;
export type Keyframe = { id: string; frame: number; property: string; value: KeyframeValue; easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' };
export type TimelineTrack = { id: string; name: string; kind: LayerKind; visible: boolean; locked: boolean; keyframes: Keyframe[] };
export type Scene = { id: string; name: string; width: number; height: number; fps: number; duration: number; tracks: TimelineTrack[] };
export type Asset = { id: string; name: string; type: 'image' | 'audio' | 'video' | 'character' | 'background'; source: string; createdAt: string };
export type StudioProject = { version: 1; name: string; activeSceneId: string; scenes: Scene[]; assets: Asset[]; createdAt: string; updatedAt: string };
export const makeId=(prefix:string)=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
export function createDefaultScene():Scene{return{id:makeId('scene'),name:'Scene 01',width:1920,height:1080,fps:24,duration:240,tracks:[
{id:makeId('track'),name:'Camera',kind:'scene',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Character',kind:'character',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Face / Expressions',kind:'face',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Rig Controls',kind:'rig',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Audio',kind:'audio',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Background',kind:'background',visible:true,locked:false,keyframes:[]}]};}
export function createDefaultProject():StudioProject{const scene=createDefaultScene();const now=new Date().toISOString();return{version:1,name:'Untitled Project',activeSceneId:scene.id,scenes:[scene],assets:[],createdAt:now,updatedAt:now};}
export function addKeyframe(scene:Scene,trackId:string,frame:number,property:string,value:KeyframeValue):Scene{return{...scene,tracks:scene.tracks.map(t=>t.id!==trackId?t:{...t,keyframes:[...t.keyframes.filter(k=>!(k.frame===frame&&k.property===property)),{id:makeId('key'),frame,property,value,easing:'linear' as const}].sort((a,b)=>a.frame-b.frame)})};}
