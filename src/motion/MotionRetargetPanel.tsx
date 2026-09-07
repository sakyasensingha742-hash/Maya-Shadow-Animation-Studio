import React,{useMemo,useRef,useState} from 'react';
import {canRetargetTo2D,defaultRetargetProfile,describeRetarget,makeMotionClip,MotionFormat,MotionTarget} from '../animation/motionRetarget';

type Props={onStatus?:(message:string)=>void};
const formats:Object.entries<Record<string,string>>=[];
const formatOptions:Array<[MotionFormat,string]>=Object.entries({
 'mixamo-fbx':'Mixamo FBX','gltf':'glTF','glb':'GLB','bvh':'BVH Motion Capture','vrm':'VRM','motion-json':'Maya Shadow Motion JSON'
}) as Array<[MotionFormat,string]>;

export default function MotionRetargetPanel({onStatus}:Props){
 const inputRef=useRef<HTMLInputElement>(null);
 const [clips,setClips]=useState(()=>[] as ReturnType<typeof makeMotionClip>[]);
 const [target,setTarget]=useState<MotionTarget>('2d-bone-rig');
 const [mirror,setMirror]=useState(defaultRetargetProfile.mirror);
 const [rootMotion,setRootMotion]=useState(defaultRetargetProfile.rootMotion);
 const [scale,setScale]=useState(defaultRetargetProfile.scale);
 const [selected,setSelected]=useState<string|null>(null);
 const selectedClip=useMemo(()=>clips.find(c=>c.id===selected)||clips[0],[clips,selected]);
 const importMotion=(event:React.ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;const lower=file.name.toLowerCase();const format:MotionFormat=lower.endsWith('.fbx')?'mixamo-fbx':lower.endsWith('.glb')?'glb':lower.endsWith('.gltf')?'gltf':lower.endsWith('.bvh')?'bvh':lower.endsWith('.vrm')?'vrm':lower.endsWith('.json')?'motion-json':'motion-json';const clip=makeMotionClip(file.name,format,file.name);setClips(prev=>[...prev,clip]);setSelected(clip.id);onStatus?.(`${file.name} loaded • ${format} motion ready for retarget mapping`);event.target.value=''};
 const apply=()=>{if(!selectedClip)return;onStatus?.(`Applied ${describeRetarget(selectedClip,target)} • scale ${scale} • mirror ${mirror?'on':'off'} • root motion ${rootMotion?'on':'off'}`)};
 return <div className="motion-retarget-panel">
  <div className="workspace-title">MOTION RETARGET STUDIO</div>
  <p className="motion-help">Bring motion-capture or Mixamo clips into Maya Shadow and map them onto your 2D/2.5D rig workflow.</p>
  <input ref={inputRef} hidden type="file" accept=".fbx,.gltf,.glb,.bvh,.vrm,.json" onChange={importMotion}/>
  <div className="motion-actions"><button className="primary" onClick={()=>inputRef.current?.click()}>＋ Import Motion</button><button onClick={()=>onStatus?.('Auto mapping uses the Maya Shadow humanoid profile')}>✦ Auto Map</button></div>
  <div className="motion-layout">
   <section className="motion-card"><h3>Motion Clips</h3>{clips.length===0?<div className="motion-empty">No motion loaded yet.<br/>Import a Mixamo FBX, BVH, glTF/GLB, VRM or Maya Shadow Motion JSON clip.</div>:clips.map(clip=><button className={`motion-clip ${selectedClip?.id===clip.id?'selected':''}`} key={clip.id} onClick={()=>setSelected(clip.id)}><b>{clip.name}</b><span>{clip.format.toUpperCase()} • {clip.fps} FPS</span></button>)}</section>
   <section className="motion-card"><h3>Retarget</h3><label>Target<select value={target} onChange={e=>setTarget(e.target.value as MotionTarget)}><option value="2d-bone-rig">2D Bone Rig</option><option value="2.5d-bone-rig">2.5D Bone Rig</option><option value="3d-character">3D Character</option></select></label><label>Scale<input type="number" min="0.01" step="0.05" value={scale} onChange={e=>setScale(Math.max(.01,Number(e.target.value)||1))}/></label><label className="check"><input type="checkbox" checked={mirror} onChange={e=>setMirror(e.target.checked)}/> Mirror motion</label><label className="check"><input type="checkbox" checked={rootMotion} onChange={e=>setRootMotion(e.target.checked)}/> Preserve root motion</label><button className="apply" disabled={!selectedClip||!canRetargetTo2D(selectedClip.format)} onClick={apply}>Apply Motion to Character</button></section>
  </div>
  <div className="motion-note">Auto bone profile: {defaultRetargetProfile.sourceBones.length} source joints → {defaultRetargetProfile.targetBones.length} Maya Shadow joints. Timing is preserved during retarget setup.</div>
 </div>;
}
