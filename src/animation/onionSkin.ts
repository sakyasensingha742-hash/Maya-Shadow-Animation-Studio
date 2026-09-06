export type OnionFrame={frame:number;opacity:number;offsetX:number;offsetY:number};
export function buildOnionFrames(current:number,range=2,opacity=.18):OnionFrame[]{const out:OnionFrame[]=[];for(let i=1;i<=range;i++){out.push({frame:current-i,opacity:opacity/i,offsetX:0,offsetY:0});out.push({frame:current+i,opacity:opacity/i,offsetX:0,offsetY:0})}return out.filter(x=>x.frame>0)}
