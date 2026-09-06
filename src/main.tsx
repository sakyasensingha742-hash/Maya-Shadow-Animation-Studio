import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const tools = [
  ['V', 'Select'], ['B', 'Brush'], ['P', 'Pen'], ['E', 'Eraser'],
  ['T', 'Text'], ['M', 'Move'], ['R', 'Rectangle'], ['O', 'Ellipse']
];

function App() {
  return (
    <div className="studio">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">M</span><div><strong>Maya Shadow</strong><small>Animation Studio</small></div></div>
        <nav className="menus"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Animate</span><span>Character</span><span>AI Tools</span><span>Export</span></nav>
        <div className="top-actions"><button>Undo</button><button>Redo</button><button className="primary">Preview</button></div>
      </header>

      <section className="toolbar">
        <div className="tool-group"><span className="group-label">Workspace</span><button className="active">Animation</button><button>Character</button><button>Background</button><button>Audio/Video</button></div>
        <div className="tool-group"><span className="group-label">Zoom</span><button>−</button><span className="zoom">100%</span><button>+</button></div>
      </section>

      <main className="workspace">
        <aside className="left-panel">
          <div className="panel-title">TOOLS</div>
          <div className="tools-grid">{tools.map(([key, label]) => <button key={key} title={label}><b>{key}</b><span>{label}</span></button>)}</div>
          <div className="panel-title section">CHARACTER</div>
          <button className="wide">＋ Import Character</button>
          <button className="wide">✦ Auto Rig Map</button>
          <button className="wide">◎ Rig Editor</button>
        </aside>

        <section className="canvas-area">
          <div className="canvas-tabs"><span className="tab active">Untitled Scene</span><span className="tab">+ New Scene</span></div>
          <div className="stage-wrap"><div className="stage"><div className="stage-cross">+</div><div className="stage-label">CANVAS<br/><small>1920 × 1080</small></div></div></div>
        </section>

        <aside className="right-panel">
          <div className="panel-title">PROPERTIES</div>
          <div className="property-card"><h3>Selection</h3><p>No object selected</p></div>
          <div className="panel-title section">LAYERS</div>
          <div className="layer active"><span>◉</span><b>Scene</b><i>Visible</i></div>
          <div className="layer"><span>◇</span>Character</div>
          <div className="layer"><span>◇</span>Background</div>
          <div className="panel-title section">ASSETS</div>
          <div className="asset-grid"><div>Characters</div><div>Props</div><div>Backgrounds</div><div>Audio</div></div>
        </aside>
      </main>

      <section className="timeline">
        <div className="timeline-head"><div><b>TIMELINE</b><span> Scene 01</span></div><div className="transport"><button>◀</button><button className="play">▶</button><button>▶</button><span>00:00:00</span></div><div><button>＋ Layer</button><button>⚙</button></div></div>
        <div className="timeline-body"><div className="track-labels"><div>Camera</div><div>Character</div><div>Audio</div><div>Background</div></div><div className="tracks"><div className="ruler">{Array.from({length: 12}, (_, i) => <span key={i}>{i + 1}</span>)}</div>{['camera','character','audio','background'].map((x, i) => <div className="track" key={x}><span className="keyframe" style={{left: `${70 + i * 18}px`}}></span></div>)}</div></div>
      </section>

      <footer><span>● Ready</span><span>Maya Shadow Animation Studio • Milestone 01</span><span>24 FPS</span></footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
