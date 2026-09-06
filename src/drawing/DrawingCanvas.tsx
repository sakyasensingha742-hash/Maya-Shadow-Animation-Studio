import React,{useRef,useState} from 'react';
import './drawing.css';

type Props={brushSize?:number;onStatus?:(message:string)=>void};
export default function DrawingCanvas({brushSize=4,onStatus}:Props){
 const ref=useRef<HTMLCanvasElement>(null);const [drawing,setDrawing]=useState(false);const [size,setSize]=useState(brushSize);
 const point=(e:React.PointerEvent)=>{const c=ref.current;if(!c)return;const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height};};
 const start=(e:React.PointerEvent)=>{const c=ref.current,p=point(e);if(!c||!p)return;const ctx=c.getContext('2d')!;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=size;ctx.beginPath();ctx.moveTo(p.x,p.y);c.setPointerCapture(e.pointerId);setDrawing(true);};
 const move=(e:React.PointerEvent)=>{if(!drawing)return;const c=ref.current,p=point(e);if(!c||!p)return;c.getContext('2d')!.lineTo(p.x,p.y);c.getContext('2d')!.stroke();};
 const clear=()=>{const c=ref.current;c?.getContext('2d')?.clearRect(0,0,c.width,c.height);onStatus?.('Drawing layer cleared')};
 return <div className="drawing-tool"><div className="drawing-controls"><b>VECTOR / DRAW</b><label>Brush <input type="range" min="1" max="40" value={size} onChange={e=>setSize(+e.target.value)}/><span>{size}px</span></label><button onClick={clear}>Clear</button></div><canvas ref={ref} width={1920} height={1080} onPointerDown={start} onPointerMove={move} onPointerUp={()=>setDrawing(false)} onPointerCancel={()=>setDrawing(false)}/></div>;
}
