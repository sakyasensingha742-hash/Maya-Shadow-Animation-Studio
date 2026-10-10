import './sceneDirector.css';

type ScenePreset={name:string;note:string;camera:string;light:string;depth:string};
const presets:ScenePreset[]=[
 {name:'Bengal Village',note:'Warm rural daylight • natural depth',camera:'Medium Wide',light:'Warm Day',depth:'2.5D Near / Mid / Far'},
 {name:'Riverbank Evening',note:'Soft sunset • cinematic atmosphere',camera:'Wide',light:'Golden Hour',depth:'Cinematic Depth'},
 {name:'Rural Interior',note:'Quiet room • soft window light',camera:'Medium',light:'Window Soft',depth:'2.5D Near / Mid / Far'},
 {name:'Night Mystery',note:'Deep shadows • dramatic moonlight',camera:'Wide',light:'Moonlight',depth:'Cinematic Depth'}
];
const KEY='maya-shadow-scene-director';
function boot(){
 if(document.querySelector('.scene-director'))return;
 const root=document.createElement('section');root.className='scene-director';
 root.innerHTML=`<div class="sd-card"><div class="sd-head"><div><span>SCENE DIRECTOR</span><h2>Background & Scene</h2><p>এক জায়গা থেকে environment, camera framing এবং scene mood সাজান।</p></div><button class="sd-close">×</button></div><div class="sd-layout"><div class="sd-panel"><b>SCENE PRESETS</b><div class="sd-presets">${presets.map((p,i)=>`<button data-preset="${i}"><strong>${p.name}</strong><small>${p.note}</small></button>`).join('')}</div></div><div class="sd-panel"><b>SHOT SETTINGS</b><label>Camera framing<select data-camera><option>Wide</option><option>Medium Wide</option><option>Medium</option><option>Close Up</option></select></label><label>Scene mood<select data-light><option>Natural Day</option><option>Warm Day</option><option>Golden Hour</option><option>Window Soft</option><option>Moonlight</option></select></label><label>Depth<select data-depth><option>Flat</option><option>2.5D Near / Mid / Far</option><option>Cinematic Depth</option></select></label><button class="sd-apply">✓ Apply Scene Setup</button></div></div><div class="sd-footer"><span data-status>Scene setup ready</span><small>Settings are saved locally and can be reused with future scene assets.</small></div></div>`;
 document.body.appendChild(root);
 const camera=root.querySelector<HTMLSelectElement>('[data-camera]')!,light=root.querySelector<HTMLSelectElement>('[data-light]')!,depth=root.querySelector<HTMLSelectElement>('[data-depth]')!,status=root.querySelector('[data-status]') as HTMLElement;
 let selectedPreset='Bengal Village';
 const presetButtons=()=>root.querySelectorAll<HTMLButtonElement>('[data-preset]');
 const syncPresetButtons=()=>presetButtons().forEach(b=>{const p=presets[Number(b.dataset.preset)||0];b.classList.toggle('active',p.name===selectedPreset)});
 const save=()=>{const setup={preset:selectedPreset,camera:camera.value,light:light.value,depth:depth.value};localStorage.setItem(KEY,JSON.stringify(setup));return setup};
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(saved.camera)camera.value=saved.camera;if(saved.light)light.value=saved.light;if(saved.depth)depth.value=saved.depth;if(saved.preset)selectedPreset=saved.preset}catch{}
 if(!presets.some(p=>p.name===selectedPreset))selectedPreset='Custom Scene';syncPresetButtons();
 camera.addEventListener('change',()=>{selectedPreset='Custom Scene';syncPresetButtons();status.textContent='Custom camera framing selected • Apply Scene Setup to update Canvas'});
 light.addEventListener('change',()=>{selectedPreset='Custom Scene';syncPresetButtons();status.textContent='Custom scene mood selected • Apply Scene Setup to update Canvas'});
 depth.addEventListener('change',()=>{selectedPreset='Custom Scene';syncPresetButtons();status.textContent='Custom depth selected • Apply Scene Setup to update Canvas'})
 root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>b.addEventListener('click',()=>{const p=presets[Number(b.dataset.preset)||0];selectedPreset=p.name;camera.value=p.camera;light.value=p.light;depth.value=p.depth;status.textContent=`${p.name} selected • ${p.note} • press Apply to update Canvas`;syncPresetButtons()}));
 root.querySelector('.sd-apply')?.addEventListener('click',()=>{const setup=save();window.dispatchEvent(new CustomEvent('maya-shadow:scene-setup',{detail:setup}));status.textContent=selectedPreset+' applied to Animation Canvas • '+setup.camera+' • '+setup.light+' • '+setup.depth});
 root.querySelector('.sd-close')?.addEventListener('click',()=>root.remove());
}
export function openSceneDirector(){boot()}
window.addEventListener('maya-shadow:open-scene-director',openSceneDirector as EventListener);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1100));else setTimeout(boot,1100);
