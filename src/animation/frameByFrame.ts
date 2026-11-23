/** Transparent PNG cels keyed by their 1-based timeline frame. */
export type FrameCel = {frame:number;image:string};
export type FrameCelMap = Record<number,string>;
export function getFrameCel(cels:FrameCelMap,frame:number):string|null{return cels[frame]||null;}
export function setFrameCel(cels:FrameCelMap,frame:number,image:string):FrameCelMap{return {...cels,[frame]:image};}
export function clearFrameCel(cels:FrameCelMap,frame:number):FrameCelMap{const next={...cels};delete next[frame];return next;}
export function duplicateFrameCel(cels:FrameCelMap,sourceFrame:number,targetFrame:number):FrameCelMap{const image=cels[sourceFrame];return image?setFrameCel(cels,targetFrame,image):cels;}
export function nearestFrameCel(cels:FrameCelMap,frame:number,direction:-1|1):FrameCel|null{const frames=Object.keys(cels).map(Number).filter(f=>direction<0?f<frame:f>frame).sort((a,b)=>direction<0?b-a:a-b);const f=frames[0];return f===undefined?null:{frame:f,image:cels[f]};}
export function listFrameCels(cels:FrameCelMap):FrameCel[]{return Object.keys(cels).map(Number).sort((a,b)=>a-b).map(frame=>({frame,image:cels[frame]}));}
