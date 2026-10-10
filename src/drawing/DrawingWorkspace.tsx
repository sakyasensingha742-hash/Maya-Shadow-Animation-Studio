import React,{useState} from 'react';
import DrawingCanvas from './DrawingCanvas';

type Props={onStatus?:(message:string)=>void;tool?:string;drawingImage?:string|null;onDrawingChange?:(dataUrl:string)=>void;onSendDrawing?:(dataUrl:string)=>void};
export default function DrawingWorkspace({onStatus,tool='Brush',drawingImage,onDrawingChange,onSendDrawing}:Props){
 const [size,setSize]=useState(6);
 return <div className="drawing-workspace"><div className="workspace-title">DRAWING & ILLUSTRATION</div><div className="drawing-toolbar"><label>Brush Size <input type="range" min="1" max="40" value={size} onChange={e=>setSize(Number(e.target.value))}/><b>{size}px</b></label><button onClick={()=>onStatus?.('Drawing layer ready')}>New Drawing Layer</button></div><DrawingCanvas brushSize={size} onStatus={onStatus} activeTool={tool} initialImage={drawingImage} onChange={onDrawingChange} onSendToCanvas={onSendDrawing}/></div>;
}
