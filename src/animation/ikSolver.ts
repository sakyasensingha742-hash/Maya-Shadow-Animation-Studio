export type Joint={id:string;x:number;y:number;rotation:number};
export type IKChain={root:string;end:string;lengths:number[]};
export function solveTwoBoneIK(root:Joint,target:{x:number;y:number},upper:number,lower:number){const dx=target.x-root.x,dy=target.y-root.y;const d=Math.max(0.0001,Math.min(Math.hypot(dx,dy),upper+lower-0.0001));const base=Math.atan2(dy,dx);const a=Math.acos(Math.max(-1,Math.min(1,(upper*upper+d*d-lower*lower)/(2*upper*d))));const b=Math.acos(Math.max(-1,Math.min(1,(upper*upper+lower*lower-d*d)/(2*upper*lower))));return{upperRotation:base-a,lowerRotation:Math.PI-b,endX:root.x+Math.cos(base)*d,endY:root.y+Math.sin(base)*d}};
export const clampAngle=(r:number,min=-Math.PI,max=Math.PI)=>Math.max(min,Math.min(max,r));
