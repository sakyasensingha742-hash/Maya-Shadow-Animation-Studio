export type MotionTransform={x:number;y:number;rotation:number;scale:number};
export type MotionEasing='linear'|'ease-in'|'ease-out'|'ease-in-out';
export type MotionKey={frame:number;transform:MotionTransform;easing?:MotionEasing};

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

function applyMotionEasing(t:number,easing:MotionEasing='ease-in-out'):number{
  const value=clamp(t,0,1);
  if(easing==='linear')return value;
  if(easing==='ease-in')return value*value;
  if(easing==='ease-out')return 1-(1-value)*(1-value);
  return value*value*(3-2*value);
}

export function interpolateMotion(keys:MotionKey[],frame:number):MotionTransform{
  if(!keys.length)return{x:0,y:0,rotation:0,scale:1};
  const sorted=[...keys].sort((a,b)=>a.frame-b.frame);
  if(frame<=sorted[0].frame)return sorted[0].transform;
  if(frame>=sorted[sorted.length-1].frame)return sorted[sorted.length-1].transform;
  const next=sorted.find(k=>k.frame>=frame)!;
  const prev=sorted[sorted.indexOf(next)-1];
  const span=Math.max(1,next.frame-prev.frame);
  const t=clamp((frame-prev.frame)/span,0,1);
  // A key's easing controls the interpolation from that key to the next.
  // Missing easing preserves the previous smoothstep behaviour for old projects.
  const progress=applyMotionEasing(t,prev.easing??'ease-in-out');
  return{
    x:prev.transform.x+(next.transform.x-prev.transform.x)*progress,
    y:prev.transform.y+(next.transform.y-prev.transform.y)*progress,
    rotation:prev.transform.rotation+(next.transform.rotation-prev.transform.rotation)*progress,
    scale:prev.transform.scale+(next.transform.scale-prev.transform.scale)*progress
  };
}

export function motionFromTrack(keyframes:Array<{frame:number;value:unknown;easing?:MotionEasing}>):MotionKey[]{
  return keyframes.map(k=>({frame:k.frame,transform:(typeof k.value==='object'&&k.value!==null?k.value:{x:0,y:0,rotation:0,scale:1}) as MotionTransform,easing:k.easing??'ease-in-out'}));
}
