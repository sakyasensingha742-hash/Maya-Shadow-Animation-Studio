import './updateCenter.css';

type DesktopBridge={
  getAppInfo?:()=>Promise<{version:string;isDev:boolean}>;
  checkForUpdate?:()=>Promise<{status:string;version?:string}>;
  downloadUpdate?:()=>Promise<{status:string}>;
  installUpdate?:()=>Promise<{status:string}>;
  onUpdateStatus?:(callback:(data:{status:string;version?:string;percent?:number;message?:string})=>void)=>()=>void;
};

declare global{interface Window{mayaShadowDesktop?:DesktopBridge}}

function boot(){
 if(document.querySelector('.update-center'))return;
 const bridge=window.mayaShadowDesktop;
 if(!bridge)return;
 const root=document.createElement('section');root.className='update-center';
 root.innerHTML=`<div class="uc-card"><div class="uc-head"><div><span>STUDIO UPDATE</span><h2>Update Center</h2><p>নতুন version এলে এখান থেকেই নিরাপদে update করুন।</p></div><button class="uc-close">×</button></div><div class="uc-status"><b class="uc-state">Checking studio…</b><small class="uc-detail">Project data update-এর সময় আলাদা থাকে।</small></div><div class="uc-actions"><button data-action="check">Check for Updates</button><button data-action="download" disabled>Download Update</button><button data-action="install" disabled>Restart & Install</button></div><div class="uc-safe"><span>✓</span><div><b>Project Safe</b><small>Projects, autosave ও recovery data update-এর সঙ্গে মুছে যাবে না।</small></div></div></div>`;
 document.body.appendChild(root);
 const state=root.querySelector('.uc-state') as HTMLElement,detail=root.querySelector('.uc-detail') as HTMLElement;
 const download=root.querySelector<HTMLButtonElement>('[data-action="download"]')!,install=root.querySelector<HTMLButtonElement>('[data-action="install"]')!;
 const setStatus=(title:string,text:string)=>{state.textContent=title;detail.textContent=text};
 const check=async()=>{setStatus('Checking for updates…','Secure update channel is being checked.');try{const r=await bridge.checkForUpdate?.();if(r?.status==='available'||r?.status==='checked'){setStatus(`Update available: v${r.version||'new'}`,'Download the verified installer when ready.');download.disabled=false}else if(r?.status==='current'){setStatus('You are up to date','No newer studio release was found.')}else{setStatus('Update service ready','You can check again when connected to the internet.')}}catch(e){setStatus('Update check failed','Please try again when internet access is available.')}};
 root.querySelector('[data-action="check"]')?.addEventListener('click',check);
 download.addEventListener('click',async()=>{download.disabled=true;setStatus('Downloading update…','Please keep the Studio open.');await bridge.downloadUpdate?.()});
 install.addEventListener('click',async()=>{install.disabled=true;setStatus('Installing update…','Studio will restart automatically.');await bridge.installUpdate?.()});
 root.querySelector('.uc-close')?.addEventListener('click',()=>root.remove());
 bridge.onUpdateStatus?.(data=>{if(data.status==='available'){setStatus(`Update available: v${data.version||'new'}`,'Verified package ready to download.');download.disabled=false}if(data.status==='downloading')setStatus(`Downloading… ${data.percent||0}%`,'Please keep the Studio open.');if(data.status==='downloaded'){setStatus(`Update ready: v${data.version||'new'}`,'Restart to install the new version.');install.disabled=false}if(data.status==='current')setStatus('You are up to date',`Current version: v${data.version||'current'}`);if(data.status==='error')setStatus('Update error',data.message||'Please try again later.')});
 void check();
}

export function openUpdateCenter(){boot()}
window.addEventListener('maya-shadow:open-update-center',openUpdateCenter as EventListener);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));else setTimeout(boot,900);
