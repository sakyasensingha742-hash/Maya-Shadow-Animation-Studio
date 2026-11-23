import React from 'react';
import {FaceAnimationValues} from './faceAnimationModel';
import './faceAnimationPreview.css';

type Props={values:FaceAnimationValues;image?:string|null};
export default function FaceAnimationPreview({values,image}:Props){
 const blinkL=Math.max(0,Math.min(100,values.leftBlink));
 const blinkR=Math.max(0,Math.min(100,values.rightBlink));
 const eyeX=(v:number)=>v*.075;
 const eyeY=(v:number)=>v*.075;
 const eye=(side:'left'|'right',blink:number)=>{const x=side==='left'?43:57;const gazeX=eyeX(values.gazeX),gazeY=eyeY(values.gazeY);return <g key={side}>
  <ellipse cx={x} cy="25" rx="1.25" ry="1.65" fill="#f6e9d8" opacity={1-blink/100}/>
  <ellipse cx={x+gazeX} cy={25+gazeY} rx=".72" ry="1.12" fill="#57382a" opacity={1-blink/100}/>
  <circle cx={x+gazeX-.18} cy={24.55+gazeY} r=".24" fill="#fff" opacity={1-blink/100}/>
  <path d={`M ${x-1.65} 25 Q ${x} ${23.1+blink*.017} ${x+1.65} 25`} fill="none" stroke="#38271f" strokeWidth=".38" strokeLinecap="round"/>
  <rect x={x-1.8} y={23.2} width="3.6" height={Math.max(.05,blink*.036)} rx=".8" fill="#b8795e" opacity={blink/100}/>
  <path d={`M ${x-1.8} 23.1 Q ${x} ${21.8+blink*.015} ${x+1.8} 23.1`} fill="none" stroke="#39261e" strokeWidth=".42" strokeLinecap="round"/>
 </g>};
 return <div className="face-preview"><div className="face-preview-head"><b>FACE LIVE PREVIEW</b><span>Frame-synced • blink / gaze / mouth</span></div><div className="face-preview-stage">
  {image?<img src={image} alt="Character face preview"/>:<div className="face-silhouette"/>}
  <svg className="face-control-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Live facial controls">{eye('left',blinkL)}{eye('right',blinkR)}
   <path d={`M 46 32 Q 50 ${32+values.smile*.012+values.mouthOpen*.012} 54 32`} fill="none" stroke="#6d302d" strokeWidth={Math.max(.25,.35+values.mouthOpen*.008)} strokeLinecap="round"/>
   {values.mouthOpen>2&&<ellipse cx="50" cy="32.4" rx={1.5+values.mouthOpen*.018} ry={.25+values.mouthOpen*.018} fill="#57252a"/>}
  </svg>
 </div><div className="face-values"><span>Blink {Math.round((blinkL+blinkR)/2)}%</span><span>Gaze {Math.round(values.gazeX)},{Math.round(values.gazeY)}</span><span>Smile {Math.round(values.smile)}%</span></div></div>;
}
