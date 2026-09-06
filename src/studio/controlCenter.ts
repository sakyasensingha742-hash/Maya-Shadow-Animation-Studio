import './controlCenter.css';

type Mode='Beginner'|'Professional';
const key='maya-shadow-ui-mode';
const command=(name:string)=>window.dispatchEvent(new CustomEvent(`maya-shadow:${name}`));
const clickText=(text:string)=>{const buttons=[...document.querySelectorAll<HTMLButtonElement>('button')];const button=buttons.find(b=>b.textContent?.trim()===text);button?.click();};
function boot(){
 if(document.querySelector('.studio-control-center')) return;
 let mode=(localStorage.getItem(key) as Mode)||'Beginner';
 const root=document.createElement('aside');root.className='studio-control-center';
 root.innerHTML=`<div class="scc-head"><div><b>STUDIO CONTROL CENTER</b><small>আপনার কাজ এক জায়গা থেকে চালান</small></div><button class="scc-close" aria-label="Close">×</button></div><div class="scc-mode"><span>WORK MODE</span><div><button data-mode="Beginner">Beginner</button><button data-mode="Professional">Professional</button></div></div><div class="scc-start"><b>START HERE</b><p>Character → Rig → Animate → Voice → Background → Export</p></div><div class="scc-actions"><button data-command="create">＋ Create Animation</button><button data-command="save">▣ Save Project</button><button data-command="character">◉ Import Character</button><button data-command="rig">✦ Auto Rig</button><button data-command="background">▧ Add Background</button><button data-command="scene">🎬 Scene Director</button><button data-command="audio">♫ Add Voice / Audio</button><button data-command="voice">🎙 Voice Studio</button><button data-command="presets">✦ Preset Library</button><button data-command="recovery">↻ Recovery Center</button><button data-command="update">↻ Update Center</button><button data-command="preview">▶ Preview</button><button data-command="export">⇧ Export / Render</button></div><div class="scc-footer"><span class="scc-dot"></span><span>Offline Studio Ready</span><span class="scc-version">v0.2.0</span></div>`;
 document.body.appendChild(root);
 const setMode=(next:Mode)=>{mode=next;localStorage.setItem(key,next);root.dataset.mode=next;root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===next));document.body.dataset.studioMode=next;};
 setMode(mode);
 root.querySelector<HTMLButtonElement>('.scc-close')?.addEventListener('click',()=>root.classList.toggle('collapsed'));
 root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode as Mode)));
 root.querySelector<HTMLButtonElement>('[data-command="create"]')?.addEventListener('click',()=>command('open-wizard'));
 root.querySelector<HTMLButtonElement>('[data-command="recovery"]')?.addEventListener('click',()=>command('open-recovery'));
 root.querySelector<HTMLButtonElement>('[data-command="update"]')?.addEventListener('click',()=>command('open-update-center'));
 root.querySelector<HTMLButtonElement>('[data-command="voice"]')?.addEventListener('click',()=>command('open-voice-studio'));
 root.querySelector<HTMLButtonElement>('[data-command="scene"]')?.addEventListener('click',()=>command('open-scene-director'));
 root.querySelector<HTMLButtonElement>('[data-command="export"]')?.addEventListener('click',()=>command('open-export-center'));
 root.querySelector<HTMLButtonElement>('[data-command="save"]')?.addEventListener('click',()=>clickText('Save Project'));
 root.querySelector<HTMLButtonElement>('[data-command="character"]')?.addEventListener('click',()=>clickText('＋ Import Character'));
 root.querySelector<HTMLButtonElement>('[data-command="rig"]')?.addEventListener('click',()=>clickText('✦ Auto Rig Map'));
 root.querySelector<HTMLButtonElement>('[data-command="background"]')?.addEventListener('click',()=>clickText('▧ Import Background'));
 root.querySelector<HTMLButtonElement>('[data-command="audio"]')?.addEventListener('click',()=>clickText('♫ Import Audio / Video'));
 root.querySelector<HTMLButtonElement>('[data-command="presets"]')?.addEventListener('click',()=>clickText('Preset Library'));
 root.querySelector<HTMLButtonElement>('[data-command="preview"]')?.addEventListener('click',()=>clickText('Preview'));
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,700)); else setTimeout(boot,700);
