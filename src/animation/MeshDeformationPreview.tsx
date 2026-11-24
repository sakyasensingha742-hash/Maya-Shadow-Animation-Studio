import React,{useMemo,useState} from 'react';
import {CharacterRig,applySmartBoneDrivers} from '../rigging/rigEngine';
import {RigPose} from './poseTrack';
import {createGridMesh,deformMesh,paintMeshWeights,mirrorMeshWeights,smoothMeshWeights,normalizeVertexWeights,AutoWeightAlgorithm} from './meshDeformer';
import './meshDeformation.css';

type Props={rig:CharacterRig;pose:RigPose;image?:string|null;onRigChange?:(rig:CharacterRig)=>void};
const mirrorPairs:Record<string,string>={upperArmL:'upperArmR',lowerArmL:'lowerArmR',handL:'handR',upperArmR:'upperArmL',lowerArmR:'lowerArmL',handR:'handL',upperLegL:'upperLegR',lowerLegL:'lowerLegR',footL:'footR',upperLegR:'upperLegL',lowerLegR:'lowerLegL',footR:'footL'};
export default function MeshDeformationPreview({rig,pose,image,onRigChange}:Props){
 const [boneId,setBoneId]=useState(rig.bones[0]?.id??'root');
 const [weightAlgorithm,setWeightAlgorithm]=useState<AutoWeightAlgorithm>('bone2d');
 const [radius,setRadius]=useState(12);
 const [strength,setStrength]=useState(.35);
 const [smoothStrength,setSmoothStrength]=useState(.55);
 const [mode,setMode]=useState<'add'|'erase'>('add');
 const [painting,setPainting]=useState(false);
 const [cursor,setCursor]=useState<{x:number;y:number}|null>(null);
 const base=useMemo(()=>createGridMesh(100,100,20,16,rig.bones,{algorithm:weightAlgorithm}),[rig.bones,weightAlgorithm]);
 const mesh=useMemo(()=>rig.meshWeights?.length===base.vertices.length?{...base,vertices:base.vertices.map((v,i)=>({...v,weights:rig.meshWeights![i]??v.weights}))}:base,[base,rig.meshWeights]);
 const rotations=useMemo(()=>applySmartBoneDrivers(Object.fromEntries(Object.entries(pose).map(([id,p])=>[id,p.rotation])),rig.smartBoneDrivers??[]),[pose,rig.smartBoneDrivers]);
 const posed=useMemo(()=>deformMesh(mesh,rig.bones,rotations),[mesh,rig.bones,rotations]);
 const changed=posed.some((v,i)=>Math.abs(v.x-mesh.vertices[i].x)>.05||Math.abs(v.y-mesh.vertices[i].y)>.05);
 const paint=(event:React.PointerEvent<SVGSVGElement>,force=false)=>{
  const rect=event.currentTarget.getBoundingClientRect();
  const point={x:Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100)),y:Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))};
  setCursor(point);
  if(!painting&&!force)return;
  const updated=paintMeshWeights(mesh,boneId,point,radius,strength,mode);
  onRigChange?.({...rig,meshWeights:updated.vertices.map(v=>v.weights)});
 };
 const mirrored=()=>{const updated=mirrorMeshWeights(mesh,mirrorPairs);onRigChange?.({...rig,meshWeights:updated.vertices.map(v=>v.weights)});};
 return <div className="mesh-preview-card">
  <div className="mesh-preview-head"><div><b>MESH DEFORMATION & WEIGHT PAINT</b><small>{changed?'Live skin deformation':'Mesh ready • paint bone influence or pose the rig'}</small></div><span>{mesh.vertices.length} vertices</span></div>
  <div className="weight-paint-toolbar">
   <label>Influence Bone<select value={boneId} onChange={e=>setBoneId(e.target.value)}>{rig.bones.map(b=><option key={b.id} value={b.id}>{b.id}</option>)}</select></label>
   <label>Brush Radius <b>{radius}</b><input type="range" min="3" max="30" value={radius} onChange={e=>setRadius(Number(e.target.value))}/></label>
   <label>Strength <b>{Math.round(strength*100)}%</b><input type="range" min=".05" max="1" step=".05" value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label>
   <label>Auto Weight Profile<select value={weightAlgorithm} onChange={e=>setWeightAlgorithm(e.target.value as AutoWeightAlgorithm)}><option value="bone2d">Smooth (Bone-2D)</option><option value="rigby">Sharp (Rigby2D)</option></select></label>
   <div className="weight-paint-actions"><button onClick={()=>onRigChange?.({...rig,meshWeights:base.vertices.map(v=>v.weights)})}>Rebuild Auto Weights</button><button className={mode==='add'?'active':''} onClick={()=>setMode('add')}>Paint</button><button className={mode==='erase'?'active':''} onClick={()=>setMode('erase')}>Erase</button><button onClick={mirrored}>Mirror L ↔ R</button><button onClick={()=>{const updated=smoothMeshWeights(mesh,boneId,smoothStrength,2);onRigChange?.({...rig,meshWeights:updated.vertices.map(v=>v.weights)});}}>Smooth Weights</button><button onClick={()=>{const reset=base.vertices.map((v,i)=>{const current={...(mesh.vertices[i]?.weights??{})};if((v.weights[boneId]??0)>0)current[boneId]=v.weights[boneId];else delete current[boneId];return {...v,weights:normalizeVertexWeights(current,rig.bones[0]?.id)}});onRigChange?.({...rig,meshWeights:reset.map(v=>v.weights)});}}>Reset Bone</button></div>
  </div>
  <div className="weight-smooth-control"><label>Smoothing Strength <b>{Math.round(smoothStrength*100)}%</b><input type="range" min=".1" max="1" step=".05" value={smoothStrength} onChange={e=>setSmoothStrength(Number(e.target.value))}/></label></div>
  <div className="mesh-stage"><svg viewBox="0 0 100 100" preserveAspectRatio="none" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setPainting(true);paint(e,true);}} onPointerMove={paint} onPointerUp={()=>setPainting(false)} onPointerCancel={()=>setPainting(false)} onPointerLeave={()=>{if(!painting)setCursor(null);}}>
   {image&&<image href={image} x="0" y="0" width="100" height="100" opacity=".28" preserveAspectRatio="none"/>}
   <g className="mesh-lines">{Array.from({length:17},(_,gy)=><polyline key={'h'+gy} points={posed.slice(gy*21,(gy+1)*21).map(v=>`${v.x},${v.y}`).join(' ')}/>)}{Array.from({length:21},(_,gx)=><polyline key={'v'+gx} points={Array.from({length:17},(_,gy)=>posed[gy*21+gx]).map(v=>`${v.x},${v.y}`).join(' ')}/>)}</g>
   <g>{mesh.vertices.map((v,i)=>{const w=v.weights[boneId]??0;return w>.025?<circle key={i} cx={posed[i].x} cy={posed[i].y} r={.45+w*.8} fill="#ffb45f" opacity={Math.min(.95,.12+w*.85)}/>:null})}</g>
   {cursor&&<circle className="weight-brush-cursor" cx={cursor.x} cy={cursor.y} r={radius}/>}
  </svg></div>
  <div className="weight-paint-footer">Drag on the mesh to paint {mode==='add'?'influence':'erase influence'} for <b>{boneId}</b>. Changes save with the bound rig.</div>
 </div>;
}
