export type RenderSettings={format:'png-sequence'|'webm'|'mp4';width:number;height:number;fps:number;quality:'draft'|'preview'|'final';transparent:boolean};
export const defaultRenderSettings:RenderSettings={format:'png-sequence',width:1920,height:1080,fps:24,quality:'preview',transparent:false};
export type RenderJob={id:string;sceneId:string;settings:RenderSettings;status:'queued'|'rendering'|'complete'|'error';progress:number};
export function createRenderJob(sceneId:string,settings:RenderSettings=defaultRenderSettings):RenderJob{return{id:`render-${Date.now()}`,sceneId,settings,status:'queued',progress:0}};
