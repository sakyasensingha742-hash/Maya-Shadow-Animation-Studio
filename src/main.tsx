import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RigMapCanvas from './rigging/RigMapCanvas';
import './styles.css';
import './rigging/rigMap.css';

const tools = [['V','Select'],['B','Brush'],['P','Pen'],['E','Eraser'],['T','Text'],['M','Move'],['R','Rectangle'],['O','Ellipse']];
const menuWorkspaces = ['Animation','Character','Background','Audio/Video'];

function App(){
  const [workspace,setWorkspace]=useState('Animation');
  const [image,setImage]=useState<string|null>(null);
  const [zoom,setZoom]=useState(100);
  const [playing,setPlaying]=useState(false);
  const [frame,setFrame]=useState(1);
  const inputRef=useRef<HTMLInputElement>(null);

  const importCharacter=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    if(!file.type.startsWith('image/')) return;
    const reader=new FileReader();
    reader.onload=()=>{setImage(String(reader.result));setWorkspace('Character');};
    reader.readAsDataURL(file);
  };

  return <div className="studio">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">M</span><div><strong>Maya Shadow</strong><small>Animation Studio</small></div></div>
      <nav className="menus">{['File','Edit','View','Insert','Animate','Character','AI Tools','Export'].map(x=><span key={x}>{x}</span>)}</nav>
      <div className="top-actions"><button>Undo</button><button>Redo</button><button className="primary" onClick={()=>setPlaying(v=>!v)}>{playing?'Stop':'Preview'}</button></div>
    </header>

    <section className="toolbar">
      <div className="tool-group"><span className="group-label">Workspace</span>{menuWorkspaces.map(x=><button key={x} className={workspace===x?'active':''} onClick={()=>setWorkspace(x)}>{x}</button>)}</div>
      <div className="tool-group"><span className="group-label">Zoom</span><button onClick={()=>setZoom(z=>Math.max(25,z-25))}>−</button><span className="zoom">{zoom}%</span><button onClick={()=>setZoom(z=>Math.min(300,z+25))}>+</button></div>
    </section>

    <main className="workspace">
      <aside className="left-panel">
        <div className="panel-title">TOOLS</div>
        <div className="tools-grid">{tools.map(([key,label])=><button key={key} title={label}><b>{key}</b><span>{label}</span></button>)}</div>
        <div className="panel-title section">CHARACTER PIPELINE</div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={importCharacter}/>
        <button className="wide" onClick={()=>inputRef.current?.click()}>＋ Import Character</button>
        <button className="wide" onClick={()=>setWorkspace('Character')}>✦ Auto Rig Map</button>
        <button className="wide" onClick={()=>setWorkspace('Character')}>◎ Rig Editor</button>
        <div className="panel-title section">PRODUCTION</div>
        <button className="wide">＋ New Scene</button><button className="wide">▣ Asset Library</button><button className="wide">◉ Camera</button>
      </aside>

      <section className="canvas-area">
        <div className="canvas-tabs"><span className="tab active">Untitled Scene</span><span className="tab">+ New Scene</span></div>
        {workspace==='Character' ? <RigMapCanvas/> : <div className="stage-wrap"><div className="stage" style={{transform:`scale(${zoom/100})`}}>
          {image ? <img src={image} alt="Imported character" className="character-image"/> : <><div className="stage-cross">+</div><div className="stage-label">CANVAS<br/><small>1920 × 1080</small></div></>}
        </div></div>}
      </section>

      <aside className="right-panel">
        <div className="panel-title">PROPERTIES</div>
        <div className="property-card"><h3>{image?'Imported Character':'Selection'}</h3><p>{image?'PNG/JPEG/WebP • Ready for rig mapping':'No object selected'}</p>{image&&<div className="property-row"><span>Zoom</span><strong>{zoom}%</strong></div>}</div>
        <div className="panel-title section">LAYERS</div>
        {['Scene','Character','Rig Controls','Background'].map((x,i)=><div className={`layer ${i===0?'active':''}`} key={x}><span>{i<2?'◉':'◇'}</span><b>{x}</b><i>{i<2?'Visible':''}</i></div>)}
        <div className="panel-title section">ASSETS</div>
        <div className="asset-grid"><div>Characters</div><div>Props</div><div>Backgrounds</div><div>Audio</div></div>
      </aside>
    </main>

    <section className="timeline">
      <div className="timeline-head"><div><b>TIMELINE</b><span> Scene 01</span></div><div className="transport"><button onClick={()=>setFrame(Math.max(1,frame-1))}>◀</button><button className="play" onClick={()=>setPlaying(v=>!v)}>{playing?'■':'▶'}</button><button onClick={()=>setFrame(frame+1)}>▶</button><span>00:{String(Math.floor(frame/24)).padStart(2,'0')}:{String(frame%24).padStart(2,'0')}</span></div><div><button>＋ Layer</button><button>⚙</button></div></div>
      <div className="timeline-body"><div className="track-labels"><div>Camera</div><div>Character</div><div>Audio</div><div>Background</div></div><div className="tracks"><div className="ruler">{Array.from({length:12},(_,i)=><span key={i}>{i+1}</span>)}</div>{['camera','character','audio','background'].map((x,i)=><div className="track" key={x}><span className="keyframe" style={{left:`${70+i*18}px`}}></span></div>)}</div></div>
    </section>
    <footer><span>● Ready</span><span>Maya Shadow Animation Studio • Professional 2D/2.5D Pipeline</span><span>24 FPS</span></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
