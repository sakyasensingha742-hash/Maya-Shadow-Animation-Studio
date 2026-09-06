import './recoveryCenter.css';
import {listRecoverySnapshots} from '../project/projectStorage';

function boot(){
 if(document.querySelector('.recovery-center'))return;
 const root=document.createElement('section');root.className='recovery-center';
 root.innerHTML=`<div class="rc-card"><div class="rc-head"><div><b>PROJECT RECOVERY</b><h2>Recovery Center</h2><p>শেষ autosave snapshot থেকে project ফিরিয়ে আনুন।</p></div><button class="rc-close">×</button></div><div class="rc-list"><div class="rc-loading">Recovery data loading…</div></div></div>`;
 document.body.appendChild(root);
 root.querySelector('.rc-close')?.addEventListener('click',()=>root.remove());
 const list=root.querySelector('.rc-list') as HTMLElement;
 listRecoverySnapshots().then(items=>{
   if(!items.length){list.innerHTML='<div class="rc-empty">কোনো recovery snapshot পাওয়া যায়নি।</div>';return;}
   list.innerHTML=items.map((s,i)=>`<div class="rc-item"><div><b>${i===0?'Latest recovery':'Recovery snapshot'}</b><small>${new Date(s.createdAt).toLocaleString()} • ${s.project.name}</small></div><button data-id="${s.id}">Restore</button></div>`).join('');
   list.querySelectorAll<HTMLButtonElement>('[data-id]').forEach(btn=>btn.addEventListener('click',()=>{
     const selected=items.find(s=>s.id===btn.dataset.id);if(!selected)return;
     window.dispatchEvent(new CustomEvent('maya-shadow:restore-project',{detail:selected.project}));root.remove();
   }));
 }).catch(()=>{list.innerHTML='<div class="rc-empty">Recovery storage এখনো প্রস্তুত নয়।</div>';});
}
export function openRecoveryCenter(){boot()}
window.addEventListener('maya-shadow:open-recovery',openRecoveryCenter as EventListener);
