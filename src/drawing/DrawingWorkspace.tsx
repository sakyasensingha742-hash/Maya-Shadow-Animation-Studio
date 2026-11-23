import React,{useEffect,useState} from 'react';
import DrawingCanvas from './DrawingCanvas';
import {FrameCelMap,getFrameCel,nearestFrameCel,setFrameCel,duplicateFrameCel,clearFrameCel,listFrameCels} from '../animation/frameByFrame';
type Props={onStatus?:(message:string)=>void;tool?:string;drawingImage?:string|null;onDrawingChange?:(dataUrl:string)=>void;onSendDrawing?:(dataUrl:string)=>void;frame?:number;duration?:number;frameCels?:FrameCelMap;onFrameCelsChange?:(cels:FrameCelMap)=>void};
export default function DrawingWorkspace({onStatus,tool='Brush',drawingImage,onDrawingChange,onSendDrawing,frame=1,duration=240,frameCels={},onFrameCelsChange}:Props){
 const [size,setSize]=useState(6),[onion,setOnion]=useState(true);const previous=nearestFrameCel(frameCels,frame,-1),next=nearestFrameCel(frameCels,frame,1),current=getFrameCel(frameCels,frame);
 const update=(image:string)=>{onFrameCelsChange?.(setFrameCel(frameCels,frame,image));onDrawingChange?.(image)};
 const addBlank=()=>{onFrameCelsChange?.(clearFrameCel(frameCels,frame));onStatus?.('Blank cel created at frame '+frame)};
 const duplicate=()=>{const source=previous?.frame??frame-1;if(source<1||!frameCels[source]){onStatus?.('No previous cel to duplicate');return}onFrameCelsChange?.(duplicateFrameCel(frameCels,source,frame));onStatus?.('Frame '+source+' duplicated to frame '+frame)};
 const remove=()=>{onFrameCelsChange?.(clearFrameCel(frameCels,frame));onStatus?.('Cel removed at frame '+frame)};
 useEffect(()=>{onDrawingChange?.(current||'')},[frame,current]);
 return <div className="drawing-workspace"><div className="workspace-title">FRAME-BY-FRAME DRAWING</div><div className="drawing-toolbar"><label>Brush Size <input type="range" min="1" max="40" value={size} onChange={e=>setSize(Number(e.target.value))}/><b>{size}px</b></label><button onClick={()=>setOnion(v=>!v)}>{onion?'Onion Skin: ON':'Onion Skin: OFF'}</button><button onClick={duplicate}>Duplicate Previous</button><button onClick={addBlank}>New Blank Cel</button><button onClick={remove}>Delete Cel</button><span>Frame {frame} / {duration}</span></div><div className="drawing-toolbar"><b>{listFrameCels(frameCels).length} cels</b><span>{previous&&onion?'Previous cel F'+previous.frame:'No previous cel'} · {next&&onion?'Next cel F'+next.frame:'No next cel'}</span></div><DrawingCanvas key={frame} brushSize={size} onStatus={onStatus} activeTool={tool} initialImage={current||null} onChange={update} onSendToCanvas={onSendDrawing}/></div>;
}
