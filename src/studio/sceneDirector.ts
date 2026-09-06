import './sceneDirector.css';

type ScenePreset={name:string;note:string;camera:string;light:string};
const presets:ScenePreset[]=[
 {name:'Bengal Village',note:'Warm rural daylight • natural depth',camera:'Medium Wide',light:'Warm Day'},
 {name:'Riverbank Evening',note:'Soft sunset • cinematic atmosphere',camera:'Wide',light:'Golden Hour'},
 {name:'Rural Interior',note:'Quiet room • soft window light',camera:'Medium',light:'Window Soft'},
 {name:'Night Mystery',note:'Deep shadows • dramatic moonlight',camera:'Wide',light:'Moonlight'}
];
const KEY='maya-shadow-scene-director';
function boot(){
 if(document.querySelector('.scene-director'))return;
 const root=document.createElement('section');root.className='scene-director';
 root.innerHTML=`<div class="sd-card"><div class="sd-head"><div><span>SCENE DIRECTOR</span><h2>Background & Scene</h2><p>এক জায়গা থেকে environment, camera framing এবং scene mood সাজান।</p></div><button class="sd-close">×</button></div><div class="sd-layout"><div class="sd-panel"><b>SCENE PRESETS</b><div class="sd-presets">${presets.map((p,i)=>`<button data-preset="${i}"><strong>${p.name}</strong><small>${p.note}</small></button>`).join('')}</div></div><div class="sd-panel"><b>SHOT SETTINGS</b><label>Camera framing<select data-camera><option>Wide</option><option>Medium Wide</option><option>Medium</option><option>Close Up</option></select></label><label>Scene mood<select data-light><option>Natural Day</option><option>Warm Day</option><option>Golden Hour</option><option>Window Soft</option><option>Moonlight</option></select></label><label>Depth<select data-depth><option>Flat</option><option>2.5D Near / Mid / Far</option><option>Cinematic Depth</option></select></label><button class="sd-apply">✓ Apply Scene Setup</button></div></div><div class="sd-footer"><span data-status>Scene setup ready</span><small>Settings are saved locally and can be reused with future scene assets.</small></div></div>`;
 document.body.appendChild(root);
 const camera=root.querySelector<HTMLSelectElement>('[data-camera]')!,light=root.querySelector<HTMLSelectElement>('[data-light]')!,depth=root.querySelector<HTMLSelectElement>('[data-depth]')!,status=root.querySelector('[data-status]') as HTMLElement;
 const save=()=>localStorage.setItem(KEY,JSON.stringify({camera:camera.value,light:light.value,depth:depth.value}));
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(saved.camera)camera.value=saved.camera;if(saved.light)light.value=saved.light;if(saved.depth)depth.value=saved.depth}catch{}
 root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>b.addEventListener('click',()=>{const p=presets[Number(b.dataset.preset)||0];camera.value=p.camera;light.value=p.light;status.textContent=`${p.name} selected • ${p.note}`;root.querySelectorAll('[data-preset]').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));
 root.querySelector('.sd-apply')?.addEventListener('click',()=>{save();window.dispatchEvent(new CustomEvent('maya-shadow:scene-setup',{detail:{camera:camera.value,light:light.value,depth:depth.value}}));status.textContent='Scene setup applied • ready for animation'});
 root.querySelector('.sd-close')?.addEventListener('click',()=>root.remove());
}
export function openSceneDirector(){boot()}
window.addEventListener('maya-shadow:open-scene-director',openSceneDirector as EventListener);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1100));else setTimeout(boot,1100);
