import './exportCenter.css';

type RenderPlan={format:'mp4'|'webm'|'png-sequence';width:number;height:number;fps:number;quality:'draft'|'preview'|'final';transparent:boolean;startFrame:number;endFrame:number;preset:string};
type Preset={name:string;platform:string;width:number;height:number;ratio:string;note:string};
const KEY='maya-shadow-render-plan';
const presets:Preset[]=[
 {name:'YouTube Landscape',platform:'YouTube',width:1920,height:1080,ratio:'16:9',note:'Full HD'},
 {name:'YouTube 4K UHD',platform:'YouTube',width:3840,height:2160,ratio:'16:9',note:'4K UHD'},
 {name:'YouTube Shorts',platform:'YouTube Shorts',width:1080,height:1920,ratio:'9:16',note:'Vertical Full HD'},
 {name:'YouTube Shorts 4K',platform:'YouTube Shorts',width:2160,height:3840,ratio:'9:16',note:'4K Vertical'},
 {name:'Instagram Reels',platform:'Instagram',width:1080,height:1920,ratio:'9:16',note:'Vertical Full HD'},
 {name:'Instagram Feed',platform:'Instagram',width:1080,height:1350,ratio:'4:5',note:'Portrait'},
 {name:'Instagram Square',platform:'Instagram',width:1080,height:1080,ratio:'1:1',note:'Square'},
 {name:'Facebook Landscape',platform:'Facebook',width:1280,height:720,ratio:'16:9',note:'HD Landscape'},
 {name:'Facebook Feed',platform:'Facebook',width:1080,height:1350,ratio:'4:5',note:'Portrait'},
 {name:'Facebook Reels',platform:'Facebook',width:1080,height:1920,ratio:'9:16',note:'Vertical Full HD'},
 {name:'TikTok',platform:'TikTok',width:1080,height:1920,ratio:'9:16',note:'Vertical Full HD'},
 {name:'X / Twitter',platform:'X',width:1280,height:720,ratio:'16:9',note:'Landscape'},
 {name:'Custom',platform:'Studio',width:1920,height:1080,ratio:'Custom',note:'Set your own canvas (up to 4K class)'}
];
function boot(){
 if(document.querySelector('.export-center'))return;
 const root=document.createElement('section');root.className='export-center';
 root.innerHTML=`<div class="ec-card"><div class="ec-head"><div><span>RENDER & EXPORT</span><h2>Export Center</h2><p>HD, Full HD, 2K এবং 4K professional delivery-এর জন্য ready-made canvas preset।</p></div><button class="ec-close" aria-label="Close">×</button></div><div class="ec-presets"><b>RESOLUTION & SOCIAL MEDIA PRESETS</b><div class="ec-preset-grid">${presets.map((p,i)=>`<button data-preset="${i}" class="${p.name==='YouTube Landscape'?'active':''}"><strong>${p.name}</strong><small>${p.platform} • ${p.width} × ${p.height} • ${p.ratio} • ${p.note}</small></button>`).join('')}</div></div><div class="ec-grid"><div class="ec-panel"><b>OUTPUT</b><label>Format<select data-format><option value="mp4">MP4 Video</option><option value="webm">WebM Video</option><option value="png-sequence">PNG Sequence</option></select></label><div class="ec-two"><label>Width<input data-width type="number" min="320" max="3840" step="1" value="1920"></label><label>Height<input data-height type="number" min="240" max="3840" step="1" value="1080"></label></div><div class="ec-ratio" data-ratio>Aspect Ratio • 16:9</div><label>FPS<select data-fps><option>24</option><option>25</option><option>30</option><option>60</option></select></label><label>Quality<select data-quality><option value="draft">Draft</option><option value="preview" selected>Preview</option><option value="final">Final / 4K</option></select></label><label class="ec-check"><input data-transparent type="checkbox"> Transparent background</label></div><div class="ec-panel"><b>FRAME RANGE</b><div class="ec-two"><label>Start<input data-start type="number" min="1" value="1"></label><label>End<input data-end type="number" min="1" value="240"></label></div><div class="ec-summary" data-summary>YouTube Landscape • 1920 × 1080 • 16:9 • 24 FPS • MP4</div><button class="ec-queue">＋ Add to Render Queue</button><button class="ec-save">⇩ Save Render Plan</button><div class="ec-queue-state" data-state>Queue is empty</div></div></div><div class="ec-foot"><span>● Up to 4K UHD ready</span><small>4K UHD: 3840 × 2160 • 4K Vertical: 2160 × 3840 • Custom resolution up to the safe 4K-class limit.</small></div></div>`;
 document.body.appendChild(root);
 const q=<T extends Element>(s:string)=>root.querySelector(s) as T;
 const format=q<HTMLSelectElement>('[data-format]'),width=q<HTMLInputElement>('[data-width]'),height=q<HTMLInputElement>('[data-height]'),fps=q<HTMLSelectElement>('[data-fps]'),quality=q<HTMLSelectElement>('[data-quality]'),transparent=q<HTMLInputElement>('[data-transparent]'),start=q<HTMLInputElement>('[data-start]'),end=q<HTMLInputElement>('[data-end]'),summary=q<HTMLElement>('[data-summary]'),state=q<HTMLElement>('[data-state]'),ratio=q<HTMLElement>('[data-ratio]');
 let selectedPreset='YouTube Landscape';
 const getRatio=(w:number,h:number)=>{if(!w||!h)return 'Custom';const value=w/h;const known:Array<[number,number,string]>=[[16,9,'16:9'],[9,16,'9:16'],[4,5,'4:5'],[1,1,'1:1']];return known.find(([a,b])=>Math.abs(value-a/b)<0.005)?.[2]||'Custom'};
 const plan=():RenderPlan=>({format:format.value as RenderPlan['format'],width:Number(width.value)||1920,height:Number(height.value)||1080,fps:Number(fps.value)||24,quality:quality.value as RenderPlan['quality'],transparent:transparent.checked,startFrame:Number(start.value)||1,endFrame:Number(end.value)||240,preset:selectedPreset});
 const refresh=()=>{const p=plan();const detected=getRatio(p.width,p.height);ratio.textContent=`Aspect Ratio • ${detected}`;summary.textContent=`${selectedPreset} • ${p.width} × ${p.height} • ${detected} • ${p.fps} FPS • ${p.format.toUpperCase()} • ${p.quality}`};
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'null') as Partial<RenderPlan>|null;if(saved){if(saved.format)format.value=saved.format;if(saved.width)width.value=String(saved.width);if(saved.height)height.value=String(saved.height);if(saved.fps)fps.value=String(saved.fps);if(saved.quality)quality.value=saved.quality;if(typeof saved.transparent==='boolean')transparent.checked=saved.transparent;if(saved.startFrame)start.value=String(saved.startFrame);if(saved.endFrame)end.value=String(saved.endFrame);if(saved.preset)selectedPreset=saved.preset}}catch{}
 root.querySelectorAll('input,select').forEach(x=>x.addEventListener('input',()=>{if((x as HTMLInputElement).dataset.width!==undefined||(x as HTMLInputElement).dataset.height!==undefined)selectedPreset='Custom';refresh()}));root.querySelectorAll('select').forEach(x=>x.addEventListener('change',refresh));
 root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(button=>button.addEventListener('click',()=>{const p=presets[Number(button.dataset.preset)||0];selectedPreset=p.name;width.value=String(p.width);height.value=String(p.height);root.querySelectorAll('[data-preset]').forEach(x=>x.classList.remove('active'));button.classList.add('active');refresh();state.textContent=`${p.name} selected • ${p.width} × ${p.height} • ${p.ratio}`;}));
 refresh();
 root.querySelector('.ec-queue')?.addEventListener('click',()=>{const p=plan();if(p.endFrame<p.startFrame){state.textContent='Invalid frame range • End frame must be greater than Start frame';return}if(p.width>3840||p.height>3840){state.textContent='Resolution exceeds 4K-class limit';return}localStorage.setItem(KEY,JSON.stringify(p));state.textContent=`Queued • ${p.preset} • ${p.startFrame}–${p.endFrame} • ${p.format.toUpperCase()}`;window.dispatchEvent(new CustomEvent('maya-shadow:render-queued',{detail:p}))});
 root.querySelector('.ec-save')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(plan(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='maya-shadow-render-plan.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);state.textContent='Render plan saved locally'});
 root.querySelector('.ec-close')?.addEventListener('click',()=>root.remove());
}
export function openExportCenter(){boot()}
window.addEventListener('maya-shadow:open-export-center',openExportCenter as EventListener);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200));else setTimeout(boot,1200);
