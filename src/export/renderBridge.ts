export type RenderFrameRequest={frame:number;requestId:string};
export type RenderFrameReady={frame:number;requestId:string};

export function installRenderFrameBridge(setFrame:(frame:number)=>void){
 const handler=(event:Event)=>{
  const detail=(event as CustomEvent<RenderFrameRequest>).detail;
  if(!detail||!Number.isFinite(detail.frame))return;
  setFrame(Math.max(1,Math.floor(detail.frame)));
  window.setTimeout(()=>window.dispatchEvent(new CustomEvent('maya-shadow:render-frame-ready',{detail:{frame:Math.max(1,Math.floor(detail.frame)),requestId:detail.requestId}})),80);
 };
 window.addEventListener('maya-shadow:render-frame-request',handler);
 return ()=>window.removeEventListener('maya-shadow:render-frame-request',handler);
}
