import {assistantReply} from './assistantModel';
import './studioAssistant.css';

function boot(){
 const root=document.createElement('aside');root.className='studio-assistant floating-assistant';
 root.innerHTML=`<div class="assistant-head"><div><b>✦ AI ASSISTANT</b><small>বাংলায় বলুন • আমি পথ দেখাব</small></div><span>READY</span></div><div class="assistant-messages"><div class="assistant-msg assistant">নমস্কার! আপনি কী করতে চান বলুন। যেমন: “character rig করব”, “background যোগ করব”, “voice বসাব” বা “কীভাবে শুরু করব?”</div></div><div class="assistant-suggestions"><button data-q="আমি নতুন, কীভাবে শুরু করব?">শুরু করি</button><button data-q="character rig করব">Character Rig</button><button data-q="background যোগ করব">Background</button><button data-q="voice বসাব">Voice / Audio</button></div><div class="assistant-input"><input placeholder="বাংলায় লিখুন…"/><button>➤</button></div>`;
 document.body.appendChild(root);
 const messages=root.querySelector('.assistant-messages') as HTMLDivElement,input=root.querySelector('input') as HTMLInputElement,sendButton=root.querySelector('.assistant-input button') as HTMLButtonElement;
 const add=(role:string,text:string)=>{const el=document.createElement('div');el.className=`assistant-msg ${role}`;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight};
 const run=(text:string)=>{const r=assistantReply(text);add('user',text);add('assistant',r.reply);const a=r.actions[0];if(a?.workspace){const buttons=[...document.querySelectorAll('button')];const b=buttons.find(x=>x.textContent?.trim()===a.workspace);(b as HTMLButtonElement|undefined)?.click()}if(a?.action==='preview'){const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Preview') as HTMLButtonElement|undefined;b?.click()}};
 const submit=()=>{const t=input.value.trim();if(t){run(t);input.value=''}};
 sendButton.addEventListener('click',submit);input.addEventListener('keydown',e=>{if(e.key==='Enter')submit()});root.querySelectorAll<HTMLButtonElement>('.assistant-suggestions button').forEach(b=>b.addEventListener('click',()=>run(b.dataset.q||'')));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,500));else setTimeout(boot,500);
