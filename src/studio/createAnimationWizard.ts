import './createAnimationWizard.css';

const steps=[
 {title:'Character',text:'Import your character image',button:'＋ Import Character'},
 {title:'Rig',text:'Open Auto Rig Map and create the skeleton',button:'✦ Auto Rig Map'},
 {title:'Animate',text:'Create poses and keyframes on the timeline',button:'Animation'},
 {title:'Voice',text:'Import dialogue or music',button:'♫ Import Audio / Video'},
 {title:'Background',text:'Choose or import a scene background',button:'▧ Import Background'},
 {title:'Export',text:'Save your project and prepare the final render',button:'Save Project'}
];

function clickButton(label:string){const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()===label) as HTMLButtonElement|undefined;b?.click()}
function boot(){
 if(document.querySelector('.create-animation-wizard'))return;
 const root=document.createElement('section');root.className='create-animation-wizard';root.innerHTML=`<div class="caw-card"><div class="caw-head"><div><span>START HERE</span><h2>Create Animation</h2><p>একটি সহজ guided workflow — ধাপে ধাপে আপনার animation তৈরি করুন।</p></div><button class="caw-close" aria-label="Close">×</button></div><div class="caw-progress"></div><div class="caw-body"></div><div class="caw-foot"><button class="caw-back">Back</button><button class="caw-next">Next</button></div></div>`;
 document.body.appendChild(root);
 const progress=root.querySelector('.caw-progress') as HTMLElement,body=root.querySelector('.caw-body') as HTMLElement,back=root.querySelector('.caw-back') as HTMLButtonElement,next=root.querySelector('.caw-next') as HTMLButtonElement;
 let index=0;
 const render=()=>{progress.innerHTML=steps.map((s,i)=>`<div class="caw-step ${i===index?'active':''} ${i<index?'done':''}"><b>${i+1}</b><span>${s.title}</span></div>`).join('');const s=steps[index];body.innerHTML=`<div class="caw-number">STEP ${String(index+1).padStart(2,'0')}</div><h3>${s.title}</h3><p>${s.text}</p><button class="caw-action">${s.button}</button>`;back.disabled=index===0;next.textContent=index===steps.length-1?'Finish':'Next';(body.querySelector('.caw-action') as HTMLButtonElement).onclick=()=>{clickButton(s.button);if(index<steps.length-1){index++;render()}}};
 (root.querySelector('.caw-close') as HTMLButtonElement).onclick=()=>root.remove();back.onclick=()=>{if(index>0){index--;render()}};next.onclick=()=>{if(index<steps.length-1){index++;render()}else root.remove()};render();
}
export function openCreateAnimationWizard(){if(!document.querySelector('.create-animation-wizard'))boot()}
window.addEventListener('maya-shadow:open-wizard',openCreateAnimationWizard as EventListener);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,700));else setTimeout(boot,700);
