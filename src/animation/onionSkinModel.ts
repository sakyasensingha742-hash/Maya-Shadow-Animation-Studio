export type OnionPose={frame:number;x:number;y:number;rotation:number;scale:number;opacity:number};
export function buildMotionOnion(current:{frame:number;x:number;y:number;rotation:number;scale:number},range:number,opacity=.16):OnionPose[]{
 const out:OnionPose[]=[];for(let i=1;i<=range;i++){out.push({frame:current.frame-i,x:current.x-i*3,y:current.y,rotation:current.rotation-i*1.5,scale:current.scale,opacity:opacity/i});out.push({frame:current.frame+i,x:current.x+i*3,y:current.y,rotation:current.rotation+i*1.5,scale:current.scale,opacity:opacity/i})}return out;
}
