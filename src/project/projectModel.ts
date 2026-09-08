export type LayerKind = 'scene' | 'character' | 'face' | 'rig' | 'background' | 'audio' | 'video' | 'drawing';
export type KeyframeValue = number | string | boolean | Record<string, number>;
export type Keyframe = { id: string; frame: number; property: string; value: KeyframeValue; easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' };
export type TimelineTrack = { id: string; name: string; kind: LayerKind; visible: boolean; locked: boolean; keyframes: Keyframe[] };
export type Scene = { id: string; name: string; width: number; height: number; fps: number; duration: number; tracks: TimelineTrack[] };
export type Asset = { id: string; name: string; type: 'image' | 'audio' | 'video' | 'character' | 'background'; source: string; createdAt: string };
export type CharacterBinding = { assetId: string; rigId: string; boundAt: string };
export type StudioProject = { version: 1; name: string; activeSceneId: string; scenes: Scene[]; assets: Asset[]; createdAt: string; updatedAt: string; activeCharacterBinding?: CharacterBinding };

// Public project defaults used by the editor, renderer and QA contracts.
export const DEFAULT_SCENE_WIDTH = 1920;
export const DEFAULT_SCENE_HEIGHT = 1080;
export const DEFAULT_SCENE_FPS = 24;
export const DEFAULT_SCENE_DURATION = 240;

export const makeId=(prefix:string)=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
export function createDefaultScene():Scene{return{id:makeId('scene'),name:'Scene 01',width:DEFAULT_SCENE_WIDTH,height:DEFAULT_SCENE_HEIGHT,fps:DEFAULT_SCENE_FPS,duration:DEFAULT_SCENE_DURATION,tracks:[
{id:makeId('track'),name:'Camera',kind:'scene',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Character',kind:'character',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Face / Expressions',kind:'face',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Rig Controls',kind:'rig',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Audio',kind:'audio',visible:true,locked:false,keyframes:[]},
{id:makeId('track'),name:'Background',kind:'background',visible:true,locked:false,keyframes:[]}]};}
export function createDefaultProject():StudioProject{const scene=createDefaultScene();const now=new Date().toISOString();return{version:1,name:'Untitled Project',activeSceneId:scene.id,scenes:[scene],assets:[],createdAt:now,updatedAt:now};}
export function addKeyframe(scene:Scene,trackId:string,frame:number,property:string,value:KeyframeValue,easing:Keyframe['easing']='linear'):Scene{return{...scene,tracks:scene.tracks.map(t=>t.id!==trackId?t:{...t,keyframes:[...t.keyframes.filter(k=>!(k.frame===frame&&k.property===property)),{id:makeId('key'),frame,property,value,easing}].sort((a,b)=>a.frame-b.frame)})};}
export function removeKeyframe(scene:Scene,trackId:string,keyframeId:string):Scene{return{...scene,tracks:scene.tracks.map(t=>t.id!==trackId?t:{...t,keyframes:t.keyframes.filter(k=>k.id!==keyframeId)})};}
export function setKeyframeEasing(scene:Scene,trackId:string,keyframeId:string,easing:NonNullable<Keyframe['easing']>):Scene{return{...scene,tracks:scene.tracks.map(t=>t.id!==trackId?t:{...t,keyframes:t.keyframes.map(k=>k.id===keyframeId?{...k,easing}:k)})};}
export function duplicateKeyframe(scene:Scene,trackId:string,keyframeId:string,targetFrame:number):Scene{const track=scene.tracks.find(t=>t.id===trackId);const source=track?.keyframes.find(k=>k.id===keyframeId);if(!source)return scene;return addKeyframe(scene,trackId,targetFrame,source.property,source.value,source.easing||'linear');}
