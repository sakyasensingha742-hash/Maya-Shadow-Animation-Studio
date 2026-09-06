import React from 'react';
import {FaceAnimationValues} from './faceAnimationModel';
import './faceAnimationPreview.css';

type Props={values:FaceAnimationValues;image?:string|null};
export default function FaceAnimationPreview({values,image}:Props){
 const blinkL=Math.max(0,Math.min(1,values.leftBlink)); const blinkR=Math.max(0,Math.min(1,values.rightBlink));
 const eyeY=(v:number)=>v*7; const eyeX=(v:number)=>v*8;
 return <div className="face-preview"><div className="face-preview-head"><b>FACE LIVE PREVIEW</b><span>Frame-synced</span></div><div className="face-preview-stage">{image?<img src={image} alt="Character face preview"/>:<div className="face-silhouette"><div className="eye ep-l"><i style={{transform:`translate(${eyeX(values.gazeX)}px,${eyeY(values.gazeY)}px)`,opacity:1-blinkL}}/></div><div className="eye ep-r"><i style={{transform:`translate(${eyeX(values.gazeX)}px,${eyeY(values.gazeY)}px)`,opacity:1-blinkR}}/></div><div className="mouth" style={{height:`${Math.max(3,10+values.mouthOpen*16)}px`,borderRadius:`0 0 ${Math.max(8,20+values.smile*8)}px ${Math.max(8,20+values.smile*8)}px`}}/></div>}</div><div className="face-values"><span>Blink {Math.round(((values.leftBlink+values.rightBlink)/2)*100)}%</span><span>Gaze {Math.round(values.gazeX)},{Math.round(values.gazeY)}</span><span>Smile {Math.round(values.smile)}%</span></div></div>;
}
