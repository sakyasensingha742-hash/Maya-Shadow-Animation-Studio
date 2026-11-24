import React from 'react';
import {FaceAnimationValues} from './faceAnimationModel';
import './faceAnimationPreview.css';

type Props={values:FaceAnimationValues;image?:string|null;mouthShape?:string|null};
export default function FaceAnimationPreview({values,image,mouthShape}:Props){
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
   {mouthShape==='rest'?<path d="M 46 32 H 54" fill="none" stroke="#6d302d" strokeWidth=".32" strokeLinecap="round"/>:mouthShape==='closed'?<g><path d="M 46 32 Q 50 32.8 54 32" fill="none" stroke="#6d302d" strokeWidth=".55"/><path d="M 48 32.25 H 52" stroke="#f2d9c8" strokeWidth=".45"/></g>:mouthShape==='small'?<ellipse cx="50" cy="32.4" rx="1.1" ry=".85" fill="#57252a"/>:mouthShape==='open'?<ellipse cx="50" cy="32.5" rx="2.55" ry="1.8" fill="#57252a"/>:mouthShape==='wide'?<g><ellipse cx="50" cy="32.5" rx="3.7" ry="2.65" fill="#57252a"/><path d="M 47.1 31.1 Q 50 30.5 52.9 31.1 L 52.6 31.8 H 47.4Z" fill="#f2d9c8"/></g>:mouthShape==='round'?<ellipse cx="50" cy="32.5" rx="1.5" ry="2.6" fill="#57252a"/>:mouthShape==='A'||mouthShape==='X'?<path d={`M 46 32 Q 50 ${32+values.smile*.012} 54 32`} fill="none" stroke="#6d302d" strokeWidth=".42" strokeLinecap="round"/>:mouthShape==='B'?<g><path d="M 46.5 32 Q 50 33 53.5 32" fill="none" stroke="#6d302d" strokeWidth=".55"/><path d="M 48 32.25 H 52" stroke="#f2d9c8" strokeWidth=".55"/></g>:mouthShape==='C'?<ellipse cx="50" cy="32.5" rx="2.2" ry="1.35" fill="#57252a"/>:mouthShape==='D'?<g><ellipse cx="50" cy="32.5" rx="3.6" ry="2.65" fill="#57252a"/><path d="M 47.2 31.1 Q 50 30.5 52.8 31.1 L 52.4 31.8 H 47.6Z" fill="#f2d9c8"/></g>:mouthShape==='E'||mouthShape==='H'?<ellipse cx="50" cy="32.5" rx={mouthShape==='E'?1.7:1.35} ry={mouthShape==='E'?2.3:1.9} fill="#57252a"/>:mouthShape==='F'?<g><path d="M 46.5 31.6 Q 50 30.8 53.5 31.6 L 52.8 33.1 Q 50 34 47.2 33.1Z" fill="#57252a"/><path d="M 47.4 31.8 Q 50 31.2 52.6 31.8" fill="none" stroke="#f2d9c8" strokeWidth=".55"/></g>:mouthShape==='G'?<g><ellipse cx="50" cy="32.5" rx="2" ry="2.1" fill="#57252a"/><path d="M 48.6 33.1 Q 50 33.7 51.4 33.1" fill="none" stroke="#d87980" strokeWidth=".55"/></g>:<><path d={`M 46 32 Q 50 ${32+values.smile*.012+values.mouthOpen*.012} 54 32`} fill="none" stroke="#6d302d" strokeWidth={Math.max(.25,.35+values.mouthOpen*.008)} strokeLinecap="round"/>{values.mouthOpen>2&&<ellipse cx="50" cy="32.4" rx={1.5+values.mouthOpen*.018} ry={.25+values.mouthOpen*.018} fill="#57252a"/>}</>}
  </svg>
 </div><div className="face-values"><span>Blink {Math.round((blinkL+blinkR)/2)}%</span><span>Gaze {Math.round(values.gazeX)},{Math.round(values.gazeY)}</span><span>Smile {Math.round(values.smile)}%</span></div></div>;
}
