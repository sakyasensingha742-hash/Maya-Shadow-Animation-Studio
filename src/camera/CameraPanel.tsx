import React from 'react';
import {Camera2D} from './cameraModel';

type Props={camera:Camera2D;onChange:(camera:Camera2D)=>void};
export default function CameraPanel({camera,onChange}:Props){
 const set=(key:keyof Camera2D,value:number)=>onChange({...camera,[key]:value});
 return <div className="camera-panel"><div className="panel-title">CAMERA 2D</div><div className="camera-grid">
  <label>X<input type="number" value={camera.x} onChange={e=>set('x',Number(e.target.value))}/></label>
  <label>Y<input type="number" value={camera.y} onChange={e=>set('y',Number(e.target.value))}/></label>
  <label>Zoom<input type="number" min="0.1" max="10" step="0.1" value={camera.zoom} onChange={e=>set('zoom',Number(e.target.value))}/></label>
  <label>Rotation<input type="number" value={camera.rotation} onChange={e=>set('rotation',Number(e.target.value))}/></label>
 </div><button className="wide" onClick={()=>onChange({x:0,y:0,zoom:1,rotation:0})}>Reset Camera</button></div>;
}
