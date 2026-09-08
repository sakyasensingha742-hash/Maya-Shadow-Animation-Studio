export type Transform={x:number;y:number;rotation:number;scale:number};
export type TransformKey={frame:number;value:Transform};
export function interpolateTransform(keys:TransformKey[],frame:number):Transform|null{if(!keys.length)return null;const sorted=[...keys].sort((a,b)=>a.frame-b.frame);if(frame<=sorted[0].frame)return sorted[0].value;if(frame>=sorted[sorted.length-1].frame)return sorted[sorted.length-1].value;const b=sorted.find(k=>k.frame>=frame)!;const a=sorted[sorted.indexOf(b)-1];const t=(frame-a.frame)/(b.frame-a.frame);return{x:a.value.x+(b.value.x-a.value.x)*t,y:a.value.y+(b.value.y-a.value.y)*t,rotation:a.value.rotation+(b.value.rotation-a.value.rotation)*t,scale:a.value.scale+(b.value.scale-a.value.scale)*t}};
export function easeIn(t:number){return t*t}
export function easeOut(t:number){return 1-(1-t)*(1-t)}
export function easeInOut(t:number){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
export function ease(t:number,type='linear'){if(type==='ease-in')return easeIn(t);if(type==='ease-out')return easeOut(t);if(type==='ease-in-out')return easeInOut(t);return t}
