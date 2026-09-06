import React,{useState} from 'react';
import {assistantReply} from './assistantModel';
import './studioAssistant.css';

type Props={onWorkspaceChange?:(workspace:string)=>void;onPreview?():void};
export default function StudioAssistant({onWorkspaceChange,onPreview}:Props){
 const [input,setInput]=useState('');
 const [messages,setMessages]=useState([{role:'assistant',text:'নমস্কার! আমি আপনার Maya Shadow Studio Assistant। আপনি বাংলায় বলুন কী করতে চান—আমি সহজ করে ধাপে ধাপে সাহায্য করব।'}]);
 const send=(text=input.trim())=>{if(!text)return;const result=assistantReply(text);setMessages(m=>[...m,{role:'user',text},{role:'assistant',text:result.reply}]);setInput('');if(result.actions[0]?.workspace)onWorkspaceChange?.(result.actions[0].workspace);if(result.actions[0]?.action==='preview')onPreview?.()};
 return <aside className="studio-assistant"><div className="assistant-head"><div><b>✦ AI ASSISTANT</b><small>সহজ ভাষায় কাজ শেখাবে</small></div><span>LOCAL READY</span></div><div className="assistant-messages">{messages.map((m,i)=><div key={i} className={`assistant-msg ${m.role}`}>{m.text}</div>)}</div><div className="assistant-suggestions"><button onClick={()=>send('আমি নতুন, কীভাবে শুরু করব?')}>কীভাবে শুরু করব?</button><button onClick={()=>send('character rig করব')}>Character Rig</button><button onClick={()=>send('background যোগ করব')}>Background</button><button onClick={()=>send('voice বসাব')}>Voice / Audio</button></div><div className="assistant-input"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}} placeholder="বাংলায় লিখুন… যেমন: character rig করব"/><button onClick={()=>send()}>➤</button></div></aside>;
}
