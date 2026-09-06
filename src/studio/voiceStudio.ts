import './voiceStudio.css';

type Marker={frame:number;value:number;label:string};
function boot(){
  if(document.querySelector('.voice-studio')) return;
  const root=document.createElement('section');root.className='voice-studio';
  root.innerHTML=`<div class="vs-card"><div class="vs-head"><div><span>VOICE & LIP SYNC</span><h2>Voice Studio</h2><p>Dialogue timing এবং mouth-animation workflow এক জায়গায়।</p></div><button class="vs-close" aria-label="Close">×</button></div><div class="vs-grid"><div class="vs-panel"><b>1 · VOICE TRACK</b><div class="vs-media"><span>Audio / Video workspace থেকে voice track ব্যবহার করুন।</span></div><button class="vs-open-audio">♫ Open Audio / Video</button></div><div class="vs-panel"><b>2 · LIP SYNC MARKERS</b><p class="vs-help">Current frame-এ mouth shape marker বসান। Marker list project session-এ সঙ্গে সঙ্গে দেখা যাবে।</p><div class="vs-marker"><label>Current frame</label><strong data-frame>1</strong></div><div class="vs-mouth"><button data-mouth="0" data-label="Closed">Closed</button><button data-mouth="0.35" data-label="Soft">Soft</button><button data-mouth="0.7" data-label="Open">Open</button><button data-mouth="1" data-label="Wide">Wide</button></div><button class="vs-add">◆ Add Mouth Marker</button><div class="vs-list" data-list><small>No markers yet</small></div></div></div><div class="vs-foot"><span>● Local timing workflow ready</span><small>AI phoneme detection: adapter ready, provider not connected</small></div></div>`;
  document.body.appendChild(root);
  const frame=root.querySelector('[data-frame]') as HTMLElement;const list=root.querySelector('[data-list]') as HTMLElement;const markers:Marker[]=[];
  const refresh=()=>{frame.textContent=(document.querySelector('.transport span')?.textContent||'F 1 / 240').replace(/^F\s*/,'').split('/')[0].trim()||'1'};
  const timer=window.setInterval(refresh,250);refresh();
  root.querySelector('.vs-close')?.addEventListener('click',()=>{window.clearInterval(timer);root.remove()});
  root.querySelector('.vs-open-audio')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('maya-shadow:open-audio')));
  root.querySelectorAll<HTMLButtonElement>('[data-mouth]').forEach(button=>button.addEventListener('click',()=>{root.querySelectorAll('[data-mouth]').forEach(x=>x.classList.remove('active'));button.classList.add('active');root.dataset.mouth=button.dataset.mouth||'0.35';root.dataset.mouthLabel=button.dataset.label||'Soft'}));
  root.querySelector('.vs-add')?.addEventListener('click',()=>{const f=Number(frame.textContent||'1');const value=Number(root.dataset.mouth||'0.35');const label=root.dataset.mouthLabel||'Soft';const existing=markers.findIndex(m=>m.frame===f);const marker={frame:f,value,label};if(existing>=0)markers[existing]=marker;else markers.push(marker);markers.sort((a,b)=>a.frame-b.frame);list.innerHTML=markers.map(m=>`<div class="vs-marker-row"><span>F ${m.frame}</span><b>${m.label}</b><small>${m.value.toFixed(2)}</small></div>`).join('');window.dispatchEvent(new CustomEvent('maya-shadow:lipsync-marker',{detail:marker}));});
}
export function openVoiceStudio(){boot()}
window.addEventListener('maya-shadow:open-voice-studio',openVoiceStudio as EventListener);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1000));else setTimeout(boot,1000);
