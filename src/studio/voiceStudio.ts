import './voiceStudio.css';

type Marker={frame:number;value:number;label:string;phoneme:string};
const KEY='maya-shadow-lipsync-markers';
const mouths=[['0','Closed','—'],['0.2','M / B / P','M'],['0.35','Soft','A'],['0.55','E / I','E'],['0.7','Open','O'],['1','Wide','AA']];
function boot(){
  if(document.querySelector('.voice-studio')) return;
  const root=document.createElement('section');root.className='voice-studio';
  root.innerHTML=`<div class="vs-card"><div class="vs-head"><div><span>VOICE & LIP SYNC</span><h2>Voice Studio</h2><p>Dialogue timing, phoneme markers এবং mouth-animation workflow এক জায়গায়।</p></div><button class="vs-close" aria-label="Close">×</button></div><div class="vs-grid"><div class="vs-panel"><b>1 · VOICE TRACK</b><div class="vs-media"><span data-media>Status: Audio / Video workspace থেকে voice track নির্বাচন করুন।</span></div><button class="vs-open-audio">♫ Open Audio / Video</button><button class="vs-auto">✦ Auto Lip Sync</button><div class="vs-ai-status" data-ai>AI phoneme detection: manual review mode</div></div><div class="vs-panel"><b>2 · LIP SYNC MARKERS</b><p class="vs-help">Current frame-এ mouth/phoneme marker বসান। Marker local session-এ সংরক্ষিত থাকবে।</p><div class="vs-marker"><label>Current frame</label><strong data-frame>1</strong></div><div class="vs-mouth">${mouths.map(m=>`<button data-mouth="${m[0]}" data-label="${m[1]}" data-phoneme="${m[2]}">${m[1]}</button>`).join('')}</div><button class="vs-add">◆ Add Mouth Marker</button><button class="vs-clear">Clear Markers</button><div class="vs-list" data-list><small>No markers yet</small></div></div></div><div class="vs-foot"><span>● Local timing workflow ready</span><small>Auto Lip Sync is model-ready but requires a connected AI provider; manual correction remains available.</small></div></div>`;
  document.body.appendChild(root);
  const frame=root.querySelector('[data-frame]') as HTMLElement;const list=root.querySelector('[data-list]') as HTMLElement;const ai=root.querySelector('[data-ai]') as HTMLElement;
  let markers:Marker[]=[];try{markers=JSON.parse(localStorage.getItem(KEY)||'[]') as Marker[]}catch{}
  const render=()=>{list.innerHTML=markers.length?markers.map(m=>`<div class="vs-marker-row"><span>F ${m.frame}</span><b>${m.label}</b><small>${m.phoneme}</small></div>`).join(''):'<small>No markers yet</small>';localStorage.setItem(KEY,JSON.stringify(markers))};
  const refresh=()=>{frame.textContent=(document.querySelector('.transport span')?.textContent||'F 1 / 240').replace(/^F\s*/,'').split('/')[0].trim()||'1'};
  const timer=window.setInterval(refresh,250);refresh();render();
  root.querySelector('.vs-close')?.addEventListener('click',()=>{window.clearInterval(timer);root.remove()});
  root.querySelector('.vs-open-audio')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('maya-shadow:open-audio')));
  root.querySelectorAll<HTMLButtonElement>('[data-mouth]').forEach(button=>button.addEventListener('click',()=>{root.querySelectorAll('[data-mouth]').forEach(x=>x.classList.remove('active'));button.classList.add('active');root.dataset.mouth=button.dataset.mouth||'0.35';root.dataset.mouthLabel=button.dataset.label||'Soft';root.dataset.phoneme=button.dataset.phoneme||'A'}));
  root.querySelector('.vs-add')?.addEventListener('click',()=>{const f=Number(frame.textContent||'1');const value=Number(root.dataset.mouth||'0.35');const label=root.dataset.mouthLabel||'Soft';const phoneme=root.dataset.phoneme||'A';const marker={frame:f,value,label,phoneme};const existing=markers.findIndex(m=>m.frame===f);if(existing>=0)markers[existing]=marker;else markers.push(marker);markers.sort((a,b)=>a.frame-b.frame);render();window.dispatchEvent(new CustomEvent('maya-shadow:lipsync-marker',{detail:marker}))});
  root.querySelector('.vs-clear')?.addEventListener('click',()=>{markers=[];render();window.dispatchEvent(new CustomEvent('maya-shadow:lipsync-clear'))});
  root.querySelector('.vs-auto')?.addEventListener('click',()=>{ai.textContent='Auto Lip Sync review queue ready • connect an AI phoneme provider to generate markers';window.dispatchEvent(new CustomEvent('maya-shadow:request-lipsync-ai'))});
}
export function openVoiceStudio(){boot()}
window.addEventListener('maya-shadow:open-voice-studio',openVoiceStudio as EventListener);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1000));else setTimeout(boot,1000);
