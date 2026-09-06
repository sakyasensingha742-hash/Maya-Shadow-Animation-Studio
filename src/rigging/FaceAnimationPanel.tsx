import React from 'react';
import {FaceAnimationValues} from './faceAnimationModel';
import './faceAnimation.css';

type Props={values:FaceAnimationValues;onChange:(v:FaceAnimationValues)=>void;onKeyframe?:(property:keyof FaceAnimationValues,value:number)=>void};
const fields:Array<{key:keyof FaceAnimationValues;label:string;min:number;max:number}>=[
 {key:'leftBlink',label:'Left Blink',min:0,max:100},{key:'rightBlink',label:'Right Blink',min:0,max:100},
 {key:'gazeX',label:'Gaze X',min:-100,max:100},{key:'gazeY',label:'Gaze Y',min:-100,max:100},
 {key:'leftBrow',label:'Left Brow',min:-100,max:100},{key:'rightBrow',label:'Right Brow',min:-100,max:100},
 {key:'mouthOpen',label:'Mouth Open',min:0,max:100},{key:'smile',label:'Smile',min:-100,max:100}
];
export default function FaceAnimationPanel({values,onChange,onKeyframe}:Props){return <div className="face-animation-panel"><div className="panel-title">FACE ANIMATION</div><div className="face-rig-groups"><section><b>Eyes / Gaze</b>{fields.slice(0,4).map(f=><Control key={f.key} field={f} value={values[f.key]} set={v=>onChange({...values,[f.key]:v})} keyframe={()=>onKeyframe?.(f.key,values[f.key])}/>)}</section><section><b>Brows / Mouth</b>{fields.slice(4).map(f=><Control key={f.key} field={f} value={values[f.key]} set={v=>onChange({...values,[f.key]:v})} keyframe={()=>onKeyframe?.(f.key,values[f.key])}/>)}</section></div></div>}
function Control({field,value,set,keyframe}:{field:{key:keyof FaceAnimationValues;label:string;min:number;max:number};value:number;set:(v:number)=>void;keyframe:()=>void}){return <div className="face-control"><label>{field.label}<span>{Math.round(value)}</span></label><div><input type="range" min={field.min} max={field.max} value={value} onChange={e=>set(Number(e.target.value))}/><button onClick={keyframe}>◆</button></div></div>}
