export type MotionTransform={x:number;y:number;rotation:number;scale:number};
export type MotionKey={frame:number;transform:MotionTransform};

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export function interpolateMotion(keys:MotionKey[],frame:number):MotionTransform{
  if(!keys.length)return{x:0,y:0,rotation:0,scale:1};
  const sorted=[...keys].sort((a,b)=>a.frame-b.frame);
  if(frame<=sorted[0].frame)return sorted[0].transform;
  if(frame>=sorted[sorted.length-1].frame)return sorted[sorted.length-1].transform;
  const next=sorted.find(k=>k.frame>=frame)!;
  const prev=sorted[sorted.indexOf(next)-1];
  const span=Math.max(1,next.frame-prev.frame);
  const t=clamp((frame-prev.frame)/span,0,1);
  const ease=t*t*(3-2*t);
  return{
    x:prev.transform.x+(next.transform.x-prev.transform.x)*ease,
    y:prev.transform.y+(next.transform.y-prev.transform.y)*ease,
    rotation:prev.transform.rotation+(next.transform.rotation-prev.transform.rotation)*ease,
    scale:prev.transform.scale+(next.transform.scale-prev.transform.scale)*ease
  };
}

export function motionFromTrack(keyframes:Array<{frame:number;value:unknown}>):MotionKey[]{
  return keyframes.map(k=>({frame:k.frame,transform:(typeof k.value==='object'&&k.value!==null?k.value:{x:0,y:0,rotation:0,scale:1}) as MotionTransform}));
}
