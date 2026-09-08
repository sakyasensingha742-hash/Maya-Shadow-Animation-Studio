export const DEFAULT_SCENE_WIDTH = 1920;
export const DEFAULT_SCENE_HEIGHT = 1080;
export const DEFAULT_SCENE_FPS = 24;
export const DEFAULT_SCENE_DURATION = 240;
export const sceneWidth = DEFAULT_SCENE_WIDTH;
export const sceneHeight = DEFAULT_SCENE_HEIGHT;

export type SceneTrack = { id:string; name:string; kind:'video'|'audio'|'character'|'camera'|'effect' };
export type Scene = { id:string; name:string; width:number; height:number; fps:number; duration:number; tracks:SceneTrack[] };

export function createDefaultScene(id='scene-1'): Scene {
  return { id, name:'Scene 1', width:DEFAULT_SCENE_WIDTH, height:DEFAULT_SCENE_HEIGHT, fps:DEFAULT_SCENE_FPS, duration:DEFAULT_SCENE_DURATION, tracks:[] };
}
