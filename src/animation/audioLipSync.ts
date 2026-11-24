import type {FaceMouthCue,OpenBoneMouthShape} from './mouthCue';

type WorkerKey={time:number;shape:OpenBoneMouthShape};
type WorkerResponse={ok:true;keys:WorkerKey[]}|{ok:false;error:string};

/**
 * Analyse a local audio URL with OpenBone's six-shape energy/spectrum lip-sync routine.
 * The CPU-heavy analysis is delegated to a module worker; this is not phoneme recognition.
 */
export async function analyzeAudioLipSync(source:string,fps:number):Promise<FaceMouthCue[]>{
 if(!source)throw new Error('Choose an audio recording first.');
 if(!Number.isFinite(fps)||fps<1||fps>120)throw new Error('Scene FPS must be between 1 and 120.');
 const response=await fetch(source);
 if(!response.ok)throw new Error('Could not read the selected audio asset. Re-import the recording and try again.');
 const encoded=await response.arrayBuffer();
 const context=new AudioContext();
 try{
  const decoded=await context.decodeAudioData(encoded.slice(0));
  if(!decoded.length||!decoded.numberOfChannels)throw new Error('The selected file contains no decodable audio.');
  if(decoded.duration>1800)throw new Error('For stability, audio lip-sync analysis is limited to 30 minutes per pass.');
  const mono=new Float32Array(decoded.length);
  for(let channel=0;channel<decoded.numberOfChannels;channel++){
   const samples=decoded.getChannelData(channel);
   for(let i=0;i<samples.length;i++)mono[i]+=samples[i]/decoded.numberOfChannels;
  }
  const keys=await new Promise<WorkerKey[]>((resolve,reject)=>{
   const worker=new Worker(new URL('./audioLipSync.worker.ts',import.meta.url),{type:'module'});
   const finish=(action:()=>void)=>{worker.terminate();action()};
   worker.onmessage=(event:MessageEvent<WorkerResponse>)=>{
    const payload=event.data;
    if('keys' in payload)finish(()=>resolve(payload.keys));
    else finish(()=>reject(new Error(payload.error)));
   };
   worker.onerror=event=>finish(()=>reject(new Error(event.message||'Audio lip-sync worker failed.')));
   worker.postMessage({samples:mono.buffer as ArrayBuffer,sampleRate:decoded.sampleRate,fps},[mono.buffer as ArrayBuffer]);
  });
  const ordered=keys.filter(key=>Number.isFinite(key.time)&&key.time>=0).sort((a,b)=>a.time-b.time);
  const cues:FaceMouthCue[]=[];
  for(let i=0;i<ordered.length;i++){
   const start=Math.max(0,ordered[i].time);
   const end=Math.min(decoded.duration,ordered[i+1]?.time??decoded.duration);
   if(end>start)cues.push({start,end,value:ordered[i].shape});
  }
  if(!cues.length)throw new Error('No usable mouth-shape keys were produced from this recording.');
  return cues;
 }finally{
  await context.close().catch(()=>undefined);
 }
}
