import React,{CSSProperties,useEffect,useMemo,useRef} from 'react';
import {CharacterRig} from '../rigging/rigEngine';
import {RigPose} from './poseTrack';
import {createGridMesh,deformMesh} from './meshDeformer';

type Props={
 image:string;
 rig:CharacterRig;
 pose:RigPose;
 className?:string;
 style?:CSSProperties;
 onPointerDown?:(e:React.PointerEvent<HTMLCanvasElement>)=>void;
 onPointerMove?:(e:React.PointerEvent<HTMLCanvasElement>)=>void;
 onPointerUp?:(e:React.PointerEvent<HTMLCanvasElement>)=>void;
 onPointerCancel?:(e:React.PointerEvent<HTMLCanvasElement>)=>void;
};

/** Render a skinned PNG into the actual animation canvas by mapping each mesh triangle.
 * This is a 2D weighted-mesh fallback for a flattened image; layered body parts still deform best. */
export default function SkinnedCharacterCanvas({image,rig,pose,className,style,onPointerDown,onPointerMove,onPointerUp,onPointerCancel}:Props){
 const canvasRef=useRef<HTMLCanvasElement|null>(null);
 const mesh=useMemo(()=>createGridMesh(100,100,20,16,rig.bones),[rig]);
 const rotations=useMemo(()=>Object.fromEntries(Object.entries(pose).map(([id,p])=>[id,p.rotation])),[pose]);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  let disposed=false;
  const source=new Image();
  source.onload=()=>{
   if(disposed)return;
   const width=Math.max(1,source.naturalWidth),height=Math.max(1,source.naturalHeight);
   canvas.width=width;canvas.height=height;
   const ctx=canvas.getContext('2d');if(!ctx)return;
   ctx.clearRect(0,0,width,height);
   const deformed=deformMesh(mesh,rig.bones,rotations);
   const vertex=(gx:number,gy:number)=>({sx:(gx/mesh.gridX)*width,sy:(gy/mesh.gridY)*height,dx:(deformed[gy*(mesh.gridX+1)+gx].x/100)*width,dy:(deformed[gy*(mesh.gridX+1)+gx].y/100)*height});
   const triangle=(a:ReturnType<typeof vertex>,b:ReturnType<typeof vertex>,c:ReturnType<typeof vertex>)=>{
    const det=(a.sx*(b.sy-c.sy)+b.sx*(c.sy-a.sy)+c.sx*(a.sy-b.sy));
    if(Math.abs(det)<0.0001)return;
    const A=(a.dx*(b.sy-c.sy)+b.dx*(c.sy-a.sy)+c.dx*(a.sy-b.sy))/det;
    const C=(a.dx*(c.sx-b.sx)+b.dx*(a.sx-c.sx)+c.dx*(b.sx-a.sx))/det;
    const E=(a.dx*(b.sx*c.sy-c.sx*b.sy)+b.dx*(c.sx*a.sy-a.sx*c.sy)+c.dx*(a.sx*b.sy-b.sx*a.sy))/det;
    const B=(a.dy*(b.sy-c.sy)+b.dy*(c.sy-a.sy)+c.dy*(a.sy-b.sy))/det;
    const D=(a.dy*(c.sx-b.sx)+b.dy*(a.sx-c.sx)+c.dy*(b.sx-a.sx))/det;
    const F=(a.dy*(b.sx*c.sy-c.sx*b.sy)+b.dy*(c.sx*a.sy-a.sx*c.sy)+c.dy*(a.sx*b.sy-b.sx*a.sy))/det;
    ctx!.save();ctx!.beginPath();ctx!.moveTo(a.dx,a.dy);ctx!.lineTo(b.dx,b.dy);ctx!.lineTo(c.dx,c.dy);ctx!.closePath();ctx!.clip();
    ctx!.transform(A,B,C,D,E,F);ctx!.drawImage(source,0,0,width,height);ctx!.restore();
   };
   for(let gy=0;gy<mesh.gridY;gy++)for(let gx=0;gx<mesh.gridX;gx++){
    const a=vertex(gx,gy),b=vertex(gx+1,gy),c=vertex(gx,gy+1),d=vertex(gx+1,gy+1);
    triangle(a,b,c);triangle(b,d,c);
   }
  };
  source.onerror=()=>{if(!disposed){const ctx=canvas.getContext('2d');ctx?.clearRect(0,0,canvas.width,canvas.height)}};
  source.src=image;
  return()=>{disposed=true;source.onload=null;source.onerror=null};
 },[image,mesh,rig,rotations]);
 return <canvas ref={canvasRef} className={className||'character-image'} style={style} aria-label="Skinned character image" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}/>;
}
