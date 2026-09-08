import React,{useMemo,useState} from 'react';

type Cue={frame:number;time:number;mouth:string;phoneme:string;word:string};

type Props={onApply?:(cues:Cue[])=>void};

const BN:Record<string,string>={
'আ':'A','অ':'A','া':'A','এ':'E','ে':'E','ই':'I','ি':'I','ঈ':'I','ী':'I','ও':'O','ো':'O','উ':'U','ু':'U','ঊ':'U','ূ':'U','ঔ':'O','ক':'C','খ':'C','গ':'C','ঘ':'C','চ':'C','ছ':'C','জ':'C','ঝ':'C','ট':'C','ঠ':'C','ড':'C','ঢ':'C','ত':'C','থ':'C','দ':'C','ধ':'C','ন':'C','প':'C','ফ':'C','ব':'C','ভ':'C','ম':'C','য':'C','র':'C','ল':'C','শ':'C','ষ':'C','স':'C','হ':'C','ড়':'C','ঢ়':'C','ং':'C','ঃ':'C','ঁ':'C'
};
const mouthFor=(s:string)=>s==='A'?'open-wide':s==='E'?'open-smile':s==='I'?'narrow':s==='O'?'round':s==='U'?'pucker':s==='C'?'consonant':'rest';

export default function AutoLipSyncPlugin({onApply}:Props){
 const [language,setLanguage]=useState<'Bengali'|'English'>('Bengali');
 const [text,setText]=useState('না রে বাবা, আমার কিছু লাগবে না। তোর সাথে একটা জরুরি কথা ছিল, তাই এলাম।');
 const [duration,setDuration]=useState(5);
 const [fps,setFps]=useState(30);
 const [status,setStatus]=useState('Ready');
 const cues=useMemo(()=>{
  const chars=[...text].filter(c=>/\S/.test(c));
  if(!chars.length)return [] as Cue[];
  const step=duration/chars.length;
  return chars.map((ch,i)=>{const phoneme=language==='Bengali'?(BN[ch]||'C'):(/[aeiou]/i.test(ch)?ch.toUpperCase():'C');return{frame:Math.max(1,Math.round((i*step)*fps)+1),time:i*step,mouth:mouthFor(phoneme),phoneme,word:ch}});
 },[text,duration,fps,language]);
 const apply=()=>{onApply?.(cues);setStatus(`${cues.length} lip-sync cues generated • ${language}`)};
 const exportTrack=()=>{const data={version:1,type:'maya-shadow-auto-lipsync',language,duration,fps,cues};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='maya-shadow-auto-lipsync.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);setStatus('Lip-sync track exported')};
 return <div className="plugin-tool"><div className="plugin-tool-head"><div><b>AUTO LIP SYNC</b><small>Bengali + English dialogue timing</small></div><span>OFFLINE ENGINE</span></div><div className="plugin-form"><label>Language<select value={language} onChange={e=>setLanguage(e.target.value as 'Bengali'|'English')}><option>Bengali</option><option>English</option></select></label><label>Dialogue duration (sec)<input type="number" min="0.2" step="0.1" value={duration} onChange={e=>setDuration(Math.max(.2,Number(e.target.value)||.2))}/></label><label>FPS<input type="number" min="1" max="120" value={fps} onChange={e=>setFps(Math.max(1,Math.min(120,Number(e.target.value)||30)))}/></label></div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="বাংলা বা English dialogue লিখুন…"/><div className="plugin-tool-summary"><b>{cues.length}</b><span>mouth cues</span><b>{duration.toFixed(1)}s</b><span>duration</span></div><div className="plugin-tool-actions"><button className="use" onClick={apply}>✓ Apply to Timeline</button><button onClick={exportTrack}>⇧ Export Track</button></div><small className="plugin-tool-status">{status} • Phoneme timing is deterministic; a future speech-to-text provider can replace the transcript step without changing the rig track format.</small></div>;
}
