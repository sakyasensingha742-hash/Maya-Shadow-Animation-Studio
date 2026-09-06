import React,{useMemo} from 'react';
import {CharacterRig} from '../rigging/rigEngine';
import {RigPose} from './poseTrack';
import {createGridMesh,deformMesh} from './meshDeformer';
import './meshDeformation.css';

type Props={rig:CharacterRig;pose:RigPose;image?:string|null};
export default function MeshDeformationPreview({rig,pose,image}:Props){
 const mesh=useMemo(()=>createGridMesh(100,100,20,16,rig.bones),[rig]);
 const posed=useMemo(()=>deformMesh(mesh,rig.bones,Object.fromEntries(Object.entries(pose).map(([id,p])=>[id,p.rotation]))),[mesh,rig,pose]);
 const changed=posed.some((v,i)=>Math.abs(v.x-mesh.vertices[i].x)>.05||Math.abs(v.y-mesh.vertices[i].y)>.05);
 return <div className="mesh-preview-card"><div className="mesh-preview-head"><div><b>MESH DEFORMATION</b><small>{changed?'Live skin deformation':'Mesh ready • create a pose key or apply IK'}</small></div><span>{mesh.vertices.length} vertices</span></div><div className="mesh-stage"><svg viewBox="0 0 100 100" preserveAspectRatio="none">{image&&<image href={image} x="0" y="0" width="100" height="100" opacity=".28" preserveAspectRatio="none"/>}<g className="mesh-lines">{Array.from({length:17},(_,gy)=><polyline key={'h'+gy} points={posed.slice(gy*21,(gy+1)*21).map(v=>`${v.x},${v.y}`).join(' ')}/>) }{Array.from({length:21},(_,gx)=><polyline key={'v'+gx} points={Array.from({length:17},(_,gy)=>posed[gy*21+gx]).map(v=>`${v.x},${v.y}`).join(' ')}/>)}</g><g className="mesh-points">{posed.filter((_,i)=>i%4===0).map((v,i)=><circle key={i} cx={v.x} cy={v.y} r=".55"/>)}</g></svg></div></div>;
}
