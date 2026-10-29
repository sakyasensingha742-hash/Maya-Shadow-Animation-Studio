import {RigBone} from '../rigging/rigEngine';

export type MeshVertex={x:number;y:number;weights:Record<string,number>};
export type DeformableMesh={vertices:MeshVertex[];width:number;height:number;gridX:number;gridY:number};

const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const rotate=(x:number,y:number,cx:number,cy:number,a:number)=>{const dx=x-cx,dy=y-cy,c=Math.cos(a),s=Math.sin(a);return{x:cx+dx*c-dy*s,y:cy+dx*s+dy*c};};

/** Creates a normalized 0–100 character mesh so it matches the rig-map coordinate system. */
export function createGridMesh(width=100,height=100,gridX=20,gridY=16,bones:RigBone[]=[]):DeformableMesh{
 const vertices:MeshVertex[]=[];
 for(let gy=0;gy<=gridY;gy++)for(let gx=0;gx<=gridX;gx++){
  const x=(gx/gridX)*width,y=(gy/gridY)*height;
  const nearest=[...bones].sort((a,b)=>Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y)).slice(0,4);
  const raw=nearest.map(b=>({id:b.id,w:1/Math.max(.75,Math.hypot(x-b.x,y-b.y))}));
  const sum=raw.reduce((n,v)=>n+v.w,0)||1;
  vertices.push({x,y,weights:Object.fromEntries(raw.map(v=>[v.id,v.w/sum]))});
 }
 return{vertices,width,height,gridX,gridY};
}

/** CPU weighted skinning preview. Rig poses are absolute world-space rotations;
 * each vertex follows the weighted delta from each bone's rest transform. */
export function deformMesh(mesh:DeformableMesh,bones:RigBone[],poses:Record<string,number>={}):MeshVertex[]{
 const byId=new Map(bones.map(b=>[b.id,b]));
 const posed= new Map<string,{x:number;y:number;rotation:number;cos:number;sin:number}>();
 const resolve=(b:RigBone):{x:number;y:number;rotation:number;cos:number;sin:number}=>{
  const cached=posed.get(b.id);if(cached)return cached;
  const parent=b.parentId?byId.get(b.parentId):undefined;
  const pr=parent?resolve(parent):null;
  const rotation=poses[b.id]??b.rotation;
  // This bone endpoint must advance by this bone's length.
  const x=pr?pr.x+Math.cos(rotation)*b.length:b.x;
  const y=pr?pr.y+Math.sin(rotation)*b.length:b.y;
  const result={x,y,rotation,cos:Math.cos(rotation),sin:Math.sin(rotation)};
  posed.set(b.id,result);return result;
 };
 bones.forEach(resolve);
 return mesh.vertices.map(v=>{
  let x=0,y=0,total=0;
  for(const [id,w0] of Object.entries(v.weights)){
   const b=byId.get(id);const p=posed.get(id);if(!b||!p)continue;
   const restLocal=rotate(v.x,v.y,b.x,b.y,-b.rotation);
   const posedPoint=rotate(restLocal.x,restLocal.y,p.x,p.y,p.rotation);
   x+=posedPoint.x*w0;y+=posedPoint.y*w0;total+=w0;
  }
  return total>0?{...v,x:x/total,y:y/total}:v;
 });
}

export function poseMapToDegrees(poses:Record<string,number>){return Object.fromEntries(Object.entries(poses).map(([id,r])=>[id,Math.round(r*180/Math.PI*10)/10]));}
export {clamp};
