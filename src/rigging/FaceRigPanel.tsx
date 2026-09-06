import React, { useState } from 'react';

type EyeState = { blink:number; gazeX:number; gazeY:number; brow:number };

export default function FaceRigPanel(){
  const [left,setLeft]=useState<EyeState>({blink:0,gazeX:0,gazeY:0,brow:0});
  const [right,setRight]=useState<EyeState>({blink:0,gazeX:0,gazeY:0,brow:0});
  const [mouth,setMouth]=useState({open:0,smile:0});
  const control=(label:string,value:number,setter:(v:number)=>void)=><label className="face-control"><span>{label}<b>{Math.round(value*100)}%</b></span><input type="range" min="-1" max="1" step="0.01" value={value} onChange={e=>setter(Number(e.target.value))}/></label>;
  return <div className="face-rig-panel">
    <div className="face-rig-title"><div><span className="eyebrow">FACIAL RIG</span><h3>Expression Controls</h3></div><span className="rig-badge">LIVE</span></div>
    <div className="eye-card"><strong>LEFT EYE</strong>{control('Blink',left.blink,v=>setLeft({...left,blink:v}))}{control('Gaze X',left.gazeX,v=>setLeft({...left,gazeX:v}))}{control('Gaze Y',left.gazeY,v=>setLeft({...left,gazeY:v}))}{control('Brow',left.brow,v=>setLeft({...left,brow:v}))}</div>
    <div className="eye-card"><strong>RIGHT EYE</strong>{control('Blink',right.blink,v=>setRight({...right,blink:v}))}{control('Gaze X',right.gazeX,v=>setRight({...right,gazeX:v}))}{control('Gaze Y',right.gazeY,v=>setRight({...right,gazeY:v}))}{control('Brow',right.brow,v=>setRight({...right,brow:v}))}</div>
    <div className="eye-card"><strong>MOUTH</strong>{control('Open',mouth.open,v=>setMouth({...mouth,open:v}))}{control('Smile',mouth.smile,v=>setMouth({...mouth,smile:v}))}</div>
    <div className="face-note">Separate sclera, iris, pupil, upper/lower eyelid, lash, highlight and eyebrow layers are reserved for the expression engine.</div>
  </div>;
}
