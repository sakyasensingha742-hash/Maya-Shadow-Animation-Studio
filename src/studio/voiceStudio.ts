import './voiceStudio.css';

type DesktopMedia={id:string;name:string;type:string;source:string;createdAt:string};

type VoiceBridge={
  media?:DesktopMedia[];
  dispatch:(name:string,detail?:unknown)=>void;
};

function boot(){
  if(document.querySelector('.voice-studio')) return;
  const root=document.createElement('section');root.className='voice-studio';
  root.innerHTML=`<div class="vs-card"><div class="vs-head"><div><span>VOICE & LIP SYNC</span><h2>Voice Studio</h2><p>Dialogue import, timing markers এবং mouth-animation workflow এক জায়গায়।</p></div><button class="vs-close" aria-label="Close">×</button></div><div class="vs-grid"><div class="vs-panel"><b>1 · VOICE TRACK</b><div class="vs-media" data-media><span>Audio workspace-এর imported voice এখানে ব্যবহার করুন।</span></div><button class="vs-open-audio">♫ Open Audio / Video</button></div><div class="vs-panel"><b>2 · LIP SYNC</b><p class="vs-help">Current frame-এ mouth marker তৈরি করুন। পরে AI phoneme detection provider যুক্ত হলে একই workflow-এ automatic markers বসানো যাবে।</p><div class="vs-marker"><label>Current frame</label><strong data-frame>1</strong></div><div class="vs-mouth"><button data-mouth="0">Closed</button><button data-mouth="0.35">Soft</button><button data-mouth="0.7">Open</button><button data-mouth="1">Wide</button></div><button class="vs-add">◆ Add Mouth Marker</button></div></div><div class="vs-foot"><span>● Local timing workflow ready</span><small>AI phoneme detection: adapter ready, provider not connected</small></div></div>`;
  document.body.appendChild(root);
  const frame=root.querySelector('[data-frame]') as HTMLElement;
  const refresh=()=>{frame.textContent=(document.querySelector('.transport span')?.textContent||'F 1 / 240').replace(/^F\s*/,'').split('/')[0].trim()||'1'};
  const timer=window.setInterval(refresh,250);refresh();
  root.querySelector('.vs-close')?.addEventListener('click',()=>{window.clearInterval(timer);root.remove()});
  root.querySelector('.vs-open-audio')?.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('maya-shadow:open-audio'))});
  root.querySelectorAll<HTMLButtonElement>('[data-mouth]').forEach(button=>button.addEventListener('click',()=>{
    root.querySelectorAll('[data-mouth]').forEach(x=>x.classList.remove('active'));button.classList.add('active');
    root.dataset.mouth=button.dataset.mouth||'0';
  }));
  root.querySelector('.vs-add')?.addEventListener('click',()=>{
    const value=Number(root.dataset.mouth||'0.35');
    const text=frame.textContent||'1';
    window.dispatchEvent(new CustomEvent('maya-shadow:add-lipsync-key',{detail:{frame:Number(text),value}}));
  });
}
export function openVoiceStudio(){boot()}
window.addEventListener('maya-shadow:open-voice-studio',openVoiceStudio as EventListener);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1000));else setTimeout(boot,1000);
