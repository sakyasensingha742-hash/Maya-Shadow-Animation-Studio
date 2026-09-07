export type RenderSettings={format:'png-sequence'|'webm'|'mp4';width:number;height:number;fps:number;quality:'draft'|'preview'|'final';transparent:boolean};

export const RENDER_LIMITS={minWidth:320,minHeight:240,maxWidth:3840,maxHeight:3840,maxPixels:3840*3840} as const;

export const resolutionPresets=[
 {name:'HD 720p',width:1280,height:720,ratio:'16:9'},
 {name:'Full HD 1080p',width:1920,height:1080,ratio:'16:9'},
 {name:'2K QHD',width:2560,height:1440,ratio:'16:9'},
 {name:'4K UHD',width:3840,height:2160,ratio:'16:9'},
 {name:'4K Vertical',width:2160,height:3840,ratio:'9:16'},
 {name:'4K Square',width:3840,height:3840,ratio:'1:1'}
] as const;

export const defaultRenderSettings:RenderSettings={format:'png-sequence',width:1920,height:1080,fps:24,quality:'preview',transparent:false};

export function validateRenderSettings(settings:RenderSettings){
 const errors:string[]=[];
 if(settings.width<RENDER_LIMITS.minWidth||settings.width>RENDER_LIMITS.maxWidth)errors.push(`Width must be ${RENDER_LIMITS.minWidth}–${RENDER_LIMITS.maxWidth}px`);
 if(settings.height<RENDER_LIMITS.minHeight||settings.height>RENDER_LIMITS.maxHeight)errors.push(`Height must be ${RENDER_LIMITS.minHeight}–${RENDER_LIMITS.maxHeight}px`);
 if(settings.width*settings.height>RENDER_LIMITS.maxPixels)errors.push('Resolution exceeds the safe 4K-class render limit');
 if(![24,25,30,60].includes(settings.fps))errors.push('FPS must be 24, 25, 30 or 60');
 if(settings.transparent&&settings.format==='mp4')errors.push('Transparent video is not supported by MP4; use PNG Sequence or WebM');
 return {valid:errors.length===0,errors};
}

export type RenderJob={id:string;sceneId:string;settings:RenderSettings;status:'queued'|'rendering'|'complete'|'error';progress:number};
export function createRenderJob(sceneId:string,settings:RenderSettings=defaultRenderSettings):RenderJob{return{id:`render-${Date.now()}`,sceneId,settings,status:'queued',progress:0}};
