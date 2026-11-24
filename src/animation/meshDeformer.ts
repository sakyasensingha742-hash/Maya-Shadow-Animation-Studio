import {RigBone} from '../rigging/rigEngine';

export type MeshVertex={x:number;y:number;weights:Record<string,number>};
export type DeformableMesh={vertices:MeshVertex[];width:number;height:number;gridX:number;gridY:number};
export type AutoWeightAlgorithm='rigby'|'bone2d';
export type AutoWeightOptions={algorithm?:AutoWeightAlgorithm;maxInfluences?:number;falloff?:number;distanceOffset?:number;minimumRelative?:number};

const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const rotate=(x:number,y:number,cx:number,cy:number,a:number)=>{const dx=x-cx,dy=y-cy,c=Math.cos(a),s=Math.sin(a);return{x:cx+dx*c-dy*s,y:cy+dx*s+dy*c};};

type BoneSegment={bone:string;from:{x:number;y:number};to:{x:number;y:number}};

/** Distance from a mesh point to the closest point on a bone segment. */
export function distanceToBoneSegment(point:{x:number;y:number},from:{x:number;y:number},to:{x:number;y:number}):number{
 const dx=to.x-from.x,dy=to.y-from.y;
 const lengthSquared=dx*dx+dy*dy;
 const t=lengthSquared>1e-10?clamp(((point.x-from.x)*dx+(point.y-from.y)*dy)/lengthSquared):0;
 return Math.hypot(point.x-(from.x+dx*t),point.y-(from.y+dy*t));
}

/**
 * Segment-aware automatic skin weights with two selectable open-source profiles.
 * Rigby2D is the sharper inverse-fourth-power mode; Bone-2D is a softer, tunable falloff.
 * Upstream: https://github.com/jaisurya-dev-art/rigby2d
 * SPDX-License-Identifier: MIT OR Apache-2.0
 */
export function autoWeightsForBones(point:{x:number;y:number},bones:RigBone[],options:AutoWeightOptions={}):Record<string,number>{
 const algorithm=options.algorithm??'rigby';
 const maxInfluences=Math.max(1,Math.floor(options.maxInfluences??4));
 const falloff=options.falloff??2.2;
 const distanceOffset=options.distanceOffset??6;
 const minimumRelative=options.minimumRelative??.04;
 const byId=new Map(bones.map(b=>[b.id,b]));
 const segments:BoneSegment[]=bones.map(b=>{
  const parent=b.parentId?byId.get(b.parentId):undefined;
  const from=parent?{x:parent.x,y:parent.y}:{x:b.x,y:b.y};
  return{bone:b.id,from,to:{x:b.x,y:b.y}};
 });
 const raw=segments.map(segment=>{
  const distance=distanceToBoneSegment(point,segment.from,segment.to);
  const weight=algorithm==='bone2d'?1/Math.pow(distance+distanceOffset,falloff):1/Math.pow(distance+1,4);
  return{id:segment.bone,weight};
 });
 if(algorithm==='bone2d'){
  const ranked=raw.sort((a,b)=>b.weight-a.weight).slice(0,maxInfluences);
  const topSum=ranked.reduce((sum,influence)=>sum+influence.weight,0);
  if(topSum<=1e-12)return bones[0]?{[bones[0].id]:1}:{};
  const kept=ranked.filter(influence=>influence.weight/topSum>=minimumRelative);
  const keptSum=kept.reduce((sum,influence)=>sum+influence.weight,0);
  if(keptSum<=1e-12)return bones[0]?{[bones[0].id]:1}:{};
  return Object.fromEntries(kept.map(influence=>[influence.id,influence.weight/keptSum]));
 }
 const total=raw.reduce((sum,influence)=>sum+influence.weight,0);
 if(total<=1e-12)return bones[0]?{[bones[0].id]:1}:{};
 const ranked=raw.map(influence=>({...influence,weight:influence.weight/total}))
  .filter(influence=>influence.weight>1e-3)
  .sort((a,b)=>b.weight-a.weight)
  .slice(0,maxInfluences);
 const keptTotal=ranked.reduce((sum,influence)=>sum+influence.weight,0);
 if(keptTotal<=1e-12)return bones[0]?{[bones[0].id]:1}:{};
 return Object.fromEntries(ranked.map(influence=>[influence.id,influence.weight/keptTotal]));
}

/** Creates a normalized 0–100 character mesh so it matches the rig-map coordinate system. */
export function createGridMesh(width=100,height=100,gridX=20,gridY=16,bones:RigBone[]=[],weightOptions:AutoWeightOptions={}):DeformableMesh{
 const vertices:MeshVertex[]=[];
 for(let gy=0;gy<=gridY;gy++)for(let gx=0;gx<=gridX;gx++){
  const x=(gx/gridX)*width,y=(gy/gridY)*height;
  vertices.push({x,y,weights:autoWeightsForBones({x,y},bones,weightOptions)});
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
  // A child bone starts at its parent's posed endpoint; its own rotation
  // controls only the direction from that joint to its endpoint.
  const x=pr&&parent?pr.x+Math.cos(pr.rotation)*parent.length:b.x;
  const y=pr&&parent?pr.y+Math.sin(pr.rotation)*parent.length:b.y;
  const result={x,y,rotation,cos:Math.cos(rotation),sin:Math.sin(rotation)};
  posed.set(b.id,result);return result;
 };
 bones.forEach(resolve);
 return mesh.vertices.map(v=>{
  let x=0,y=0,total=0;
  for(const [id,w0] of Object.entries(v.weights)){
   const b=byId.get(id);const p=posed.get(id);if(!b||!p)continue;
   const parent=b.parentId?byId.get(b.parentId):undefined;
   // RigBone x/y stores the child endpoint; skinning must rotate around the
   // bone's rest start (the parent endpoint), not around its own endpoint.
   const restStartX=parent?parent.x:b.x;
   const restStartY=parent?parent.y:b.y;
   const restLocal=rotate(v.x,v.y,restStartX,restStartY,-b.rotation);
   const posedPoint=rotate(restLocal.x,restLocal.y,p.x,p.y,p.rotation);
   x+=posedPoint.x*w0;y+=posedPoint.y*w0;total+=w0;
  }
  return total>0?{...v,x:x/total,y:y/total}:v;
 });
}

export function poseMapToDegrees(poses:Record<string,number>){return Object.fromEntries(Object.entries(poses).map(([id,r])=>[id,Math.round(r*180/Math.PI*10)/10]));}
export {clamp};


/** Normalize a vertex influence map so every vertex has a stable unit weight sum. */
export function normalizeVertexWeights(weights:Record<string,number>,fallbackBoneId?:string):Record<string,number>{
 const safe=Object.fromEntries(Object.entries(weights).map(([id,w])=>[id,Number.isFinite(w)?Math.max(0,w):0]));
 const total=Object.values(safe).reduce((sum,w)=>sum+w,0);
 if(total<=1e-8)return fallbackBoneId?{[fallbackBoneId]:1}:{};
 return Object.fromEntries(Object.entries(safe).filter(([,w])=>w>1e-8).map(([id,w])=>[id,w/total]));
}

/** Paint a smooth radial influence onto the selected bone. Returns a new mesh. */
export function paintMeshWeights(
 mesh:DeformableMesh,
 boneId:string,
 center:{x:number;y:number},
 radius:number,
 strength:number,
 mode:'add'|'erase'='add',
):DeformableMesh{
 const safeRadius=Math.max(.001,Math.abs(radius));
 const amount=clamp(Math.abs(strength));
 const vertices=mesh.vertices.map(vertex=>{
  const distance=Math.hypot(vertex.x-center.x,vertex.y-center.y);
  if(distance>=safeRadius)return vertex;
  const falloff=(1-distance/safeRadius)**2;
  const delta=amount*falloff;
  const weights={...vertex.weights};
  const before=normalizeVertexWeights(weights);
  if(mode==='add'){
   const current=before[boneId]??0;
   weights[boneId]=current+(1-current)*delta;
  }else{
   weights[boneId]=(before[boneId]??0)*(1-delta);
  }
  const normalized=normalizeVertexWeights(weights);
  return{...vertex,weights:normalized};
 });
 return{...mesh,vertices};
}

/** Copy mirrored vertex influences across an axis using an explicit left/right bone map. */
export function mirrorMeshWeights(
 mesh:DeformableMesh,
 bonePairs:Record<string,string>,
 axisX=mesh.width/2,
 tolerance=Math.max(mesh.width/mesh.gridX,mesh.height/mesh.gridY)*.55,
):DeformableMesh{
 const vertices=mesh.vertices;
 const result=vertices.map(v=>({...v,weights:{...v.weights}}));
 for(let i=0;i<vertices.length;i++){
  const source=vertices[i];
  const targetX=axisX-(source.x-axisX);
  let match=-1,best=Infinity;
  for(let j=0;j<vertices.length;j++){
   const candidate=vertices[j];
   const distance=Math.hypot(candidate.x-targetX,candidate.y-source.y);
   if(distance<best){best=distance;match=j;}
  }
  if(match<0||best>tolerance||source.x>axisX)continue;
  const mirrored:Record<string,number>={};
  for(const [boneId,weight] of Object.entries(source.weights)){
   const paired=bonePairs[boneId]??boneId;
   mirrored[paired]=(mirrored[paired]??0)+weight;
  }
  result[match]={...result[match],weights:normalizeVertexWeights(mirrored)};
 }
 return{...mesh,vertices:result};
}

/** Smooth one bone's influence over the regular grid while preserving normalized weights. */
export function smoothMeshWeights(mesh:DeformableMesh,boneId:string,strength=.5,iterations=1):DeformableMesh{
 const amount=clamp(strength);let vertices=mesh.vertices.map(v=>({...v,weights:{...v.weights}}));
 const width=mesh.gridX+1,height=mesh.gridY+1;
 for(let pass=0;pass<Math.max(1,Math.min(8,Math.floor(iterations)));pass++){
  const next=vertices.map((v,index)=>{const x=index%width,y=Math.floor(index/width),neighbors:number[]=[];
   if(x>0)neighbors.push(index-1);if(x<width-1)neighbors.push(index+1);if(y>0)neighbors.push(index-width);if(y<height-1)neighbors.push(index+width);
   if(!neighbors.length)return v;const average=neighbors.reduce((sum,i)=>sum+(vertices[i].weights[boneId]??0),0)/neighbors.length;
   const weights={...v.weights,[boneId]:(v.weights[boneId]??0)*(1-amount)+average*amount};return{...v,weights:normalizeVertexWeights(weights)};
  });vertices=next;
 }
 return{...mesh,vertices};
}
