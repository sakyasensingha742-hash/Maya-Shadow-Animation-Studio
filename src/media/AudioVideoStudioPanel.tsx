import React,{useMemo,useRef,useState} from 'react';
import {Asset} from '../project/projectModel';
import './audioVideoStudio.css';

type Props={assets:Asset[];onImport:()=>void;onStatus:(message:string)=>void};
const audioEffects=['DeNoise','Noise Gate','DeHum 50/60Hz','DeEsser','Parametric EQ','Compressor','Limiter','Loudness Normalize','DeReverb','Voice Clarity','Room Tone Repair','Silence Trim'];
const videoTools=['Trim & Ripple','Cut / Split','Speed Ramp','Freeze Frame','Crop / Pan / Zoom','Color Correction','Audio Ducking','Scene Detection','Auto Captions','Shot Stabilizer','Motion Blur','Transitions'];

export default function AudioVideoStudioPanel({assets,onImport,onStatus}:Props){
 const media=useMemo(()=>assets.filter(a=>a.type==='audio'||a.type==='video'),[assets]);
 const [selectedId,setSelectedId]=useState(media[0]?.id||'');
 const selected=media.find(a=>a.id===selectedId);
 const [mode,setMode]=useState<'audio'|'video'>(selected?.type==='video'?'video':'audio');
 const [gain,setGain]=useState(0),[speed,setSpeed]=useState(1),[trimStart,setTrimStart]=useState(0),[trimEnd,setTrimEnd]=useState(100),[activeEffects,setActiveEffects]=useState<string[]>([]);
 const audioRef=useRef<HTMLAudioElement>(null);const videoRef=useRef<HTMLVideoElement>(null);
 const select=(a:Asset)=>{setSelectedId(a.id);setMode(a.type);onStatus(`${a.type==='audio'?'Audio':'Video'} clip selected: ${a.name}`)};
 const toggleEffect=(effect:string)=>setActiveEffects(v=>v.includes(effect)?v.filter(x=>x!==effect):[...v,effect]);
 const preview=()=>{if(mode==='audio'&&audioRef.current){audioRef.current.volume=Math.min(1,Math.max(0,Math.pow(10,gain/20)));void audioRef.current.play()}else if(videoRef.current){videoRef.current.playbackRate=speed;void videoRef.current.play()}};
 return <div className="av-studio">
  <div className="av-head"><div><div className="workspace-title">PRO AUDIO + VIDEO EDITOR</div><p>Waveform • Multitrack • Spectral • Video timeline • AI-assisted finishing</p></div><button className="primary" onClick={onImport}>＋ Import Media</button></div>
  <div className="av-tabs"><button className={mode==='audio'?'active':''} onClick={()=>setMode('audio')}>🎚 Audio Lab</button><button className={mode==='video'?'active':''} onClick={()=>setMode('video')}>🎬 Video Lab</button><button onClick={()=>onStatus('AI Finishing tools are ready for the media pipeline')}>🧠 AI Finishing</button><button onClick={()=>onStatus('Loudness and scope monitoring selected')}>📈 Loudness / Scope</button></div>
  <div className="av-layout">
   <aside className="av-library"><b>MEDIA BIN</b>{media.length===0&&<span className="muted">No media imported</span>}{media.map(a=><button key={a.id} className={selectedId===a.id?'selected':''} onClick={()=>select(a)}><strong>{a.type==='audio'?'♫':'▣'}</strong><span>{a.name}</span></button>)}</aside>
   <section className="av-editor">
    <div className="av-preview">{selected?.type==='video'?<video ref={videoRef} src={selected.source} controls style={{filter:`brightness(${1+gain/100})`}}/>:selected?<><div className="waveform"><div className="wave-grid"/>{Array.from({length:72},(_,i)=><i key={i} style={{height:`${18+Math.abs(Math.sin(i*.83))*62}%`}}/>)}</div><audio ref={audioRef} src={selected.source} controls/></>:<div className="empty-editor">Import a voice, music, SFX or video clip to begin.</div>}</div>
    {mode==='audio'?<>
      <div className="tool-strip"><b>WAVEFORM / SPECTRAL</b><button onClick={()=>onStatus('Spectral Frequency view enabled')}>Spectral View</button><button onClick={()=>onStatus('Waveform editor selected')}>Waveform</button><button onClick={()=>onStatus('Noise profile capture armed')}>Capture Noise Print</button></div>
      <div className="fx-grid">{audioEffects.map(e=><button key={e} className={activeEffects.includes(e)?'on':''} onClick={()=>{toggleEffect(e);onStatus(`${e} ${activeEffects.includes(e)?'disabled':'enabled'} for preview`)}}>{activeEffects.includes(e)?'●':'○'} {e}</button>)}</div>
      <div className="control-grid"><label>Gain <input type="range" min="-24" max="12" value={gain} onChange={e=>setGain(+e.target.value)}/><b>{gain} dB</b></label><label>EQ Low <input type="range" min="-12" max="12" defaultValue="0"/></label><label>EQ Mid <input type="range" min="-12" max="12" defaultValue="0"/></label><label>EQ High <input type="range" min="-12" max="12" defaultValue="0"/></label></div>
      <div className="action-row"><button onClick={preview}>▶ Preview FX</button><button onClick={()=>onStatus('Voice cleanup chain queued: DeNoise → DeHum → DeEsser → EQ → Compressor → Limiter')}>✨ Voice Cleanup</button><button onClick={()=>onStatus('Loudness normalization queued for -16 LUFS target')}>LUFS Normalize</button><button onClick={()=>onStatus('Audio export will use the FFmpeg render pipeline')}>Export WAV / MP3 / FLAC</button></div>
    </>:<>
      <div className="tool-strip"><b>VIDEO EDITING</b>{videoTools.slice(0,7).map(t=><button key={t} onClick={()=>onStatus(`${t} tool selected`)}>{t}</button>)}</div>
      <div className="video-controls"><label>In <input type="range" min="0" max="100" value={trimStart} onChange={e=>setTrimStart(+e.target.value)}/>{trimStart}%</label><label>Out <input type="range" min="0" max="100" value={trimEnd} onChange={e=>setTrimEnd(+e.target.value)}/>{trimEnd}%</label><label>Speed <select value={speed} onChange={e=>setSpeed(+e.target.value)}><option value="0.25">0.25</option><option value="0.5">0.5</option><option value="1">1</option><option value="1.5">1.5</option><option value="2">2</option><option value="4">4</option></select>x</label></div>
      <div className="tool-strip secondary">{videoTools.slice(7).map(t=><button key={t} onClick={()=>onStatus(`${t} queued for the video pipeline`)}>{t}</button>)}</div>
      <div className="action-row"><button onClick={preview}>▶ Preview Edit</button><button onClick={()=>onStatus('AI scene detection queued')}>AI Scene Detection</button><button onClick={()=>onStatus('Auto captions queued for Bengali + English')}>Auto Captions</button><button onClick={()=>onStatus('Video export will use the FFmpeg render pipeline')}>Export MP4 / WebM</button></div>
    </>}
    <div className="multitrack"><div className="track-title">MULTITRACK SESSION</div>{['Dialogue / VO','Music','SFX / Ambience','Video','Captions'].map((t,i)=><div className="media-track" key={t}><span>{t}</span><div className="clip" style={{left:`${8+i*7}%`,width:`${30+i*8}%`}}>{selected?.name||'Empty track'}</div></div>)}</div>
   </section>
  </div>
 </div>;
}
