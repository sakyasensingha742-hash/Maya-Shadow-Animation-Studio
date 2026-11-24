import {lipSync} from '@openbone/core';

type Request={samples:ArrayBuffer;sampleRate:number;fps:number};
type Key={time:number;shape:'rest'|'closed'|'small'|'open'|'wide'|'round'};
type Response={ok:true;keys:Key[]}|{ok:false;error:string};
const worker=self as unknown as {
 onmessage:((event:MessageEvent<Request>)=>void)|null;
 postMessage:(message:Response)=>void;
};
worker.onmessage=event=>{
 try{
  const {samples,sampleRate,fps}=event.data;
  const data=new Float32Array(samples);
  const keys=lipSync(data,sampleRate,{fps,minHold:2}) as Key[];
  worker.postMessage({ok:true,keys});
 }catch(error){
  worker.postMessage({ok:false,error:error instanceof Error?error.message:'Audio lip-sync analysis failed.'});
 }
};
