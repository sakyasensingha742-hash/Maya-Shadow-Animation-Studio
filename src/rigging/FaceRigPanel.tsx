import React from 'react';
import {FaceAnimationValues,defaultFaceAnimation,clampFace} from './faceAnimationModel';
import './faceAnimation.css';
type Props={values?:FaceAnimationValues;onChange?:(values:FaceAnimationValues)=>void;onKeyframe?:(property:keyof FaceAnimationValues)=>void};
export default function FaceRigPanel({values=defaultFaceAnimation,onChange,onKeyframe}:Props){
 const set=(key:keyof FaceAnimationValues,v:number)=>onChange?.({...values,[key]:clampFace(v*100)});
 const control=(key:keyof FaceAnimationValues,label:string)=>{const value=values[key]/100;return <label className="face-control"><span>{label}<b>{Math.round(value*100)}%</b></span><div><input type="range" min="-1" max="1" step="0.01" value={value} onChange={e=>set(key,Number(e.target.value))}/><button type="button" title={`Keyframe ${label}`} onClick={()=>onKeyframe?.(key)}>◆</button></div></label>};
 return <div className="face-animation-panel"><div className="face-rig-title"><div><span className="eyebrow">FACIAL RIG</span><h3>Expression Controls</h3></div><span className="rig-badge">LIVE</span></div><div className="face-rig-groups"><section><b>LEFT EYE</b>{control('leftBlink','Blink')}{control('gazeX','Gaze X')}{control('gazeY','Gaze Y')}{control('leftBrow','Brow')}</section><section><b>RIGHT EYE</b>{control('rightBlink','Blink')}{control('gazeX','Gaze X')}{control('gazeY','Gaze Y')}{control('rightBrow','Brow')}</section><section><b>MOUTH / PHONEMES</b>{control('mouthOpen','Open')}{control('smile','Smile')}</section></div><div className="face-note">◆ creates a timeline keyframe at the current frame. Eye layers: sclera, iris, pupil, upper/lower eyelid, lash and highlight.</div></div>;
}
