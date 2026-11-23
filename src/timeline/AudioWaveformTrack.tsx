import React,{useEffect,useState} from 'react';
import {Asset} from '../project/projectModel';
type Props={asset:Asset;fps:number;zoom:number;onStatus?:(message:string)=>void};
export default function AudioWaveformTrack({asset,fps,zoom,onStatus}:Props){
 const [peaks,setPeaks]=useState<number[]>([]);const [duration,setDuration]=useState(0);const [error,setError]=useState('');
 useEffect(()=>{let cancelled=false;let context:AudioContext|undefined;
  const decode=async()=>{try{const response=await fetch(asset.source);const data=await response.arrayBuffer();context=new AudioContext();const buffer=await context.decodeAudioData(data.slice(0));if(cancelled)return;const channelCount=buffer.numberOfChannels;const samples=buffer.length;const count=Math.min(1400,Math.max(120,Math.ceil(buffer.duration*24)));const values:number[]=[];for(let i=0;i<count;i++){const start=Math.floor(i*samples/count),end=Math.max(start+1,Math.floor((i+1)*samples/count));let peak=0;for(let ch=0;ch<channelCount;ch++){const channel=buffer.getChannelData(ch);for(let j=start;j<end;j+=Math.max(1,Math.floor((end-start)/100))){peak=Math.max(peak,Math.abs(channel[j]||0))}}values.push(peak)}if(!cancelled){setPeaks(values);setDuration(buffer.duration);setError('')}}catch(e){if(!cancelled){setError('Waveform decode unavailable');onStatus?.('Could not decode audio waveform for '+asset.name)}}finally{await context?.close().catch(()=>{})}};
  void decode();return()=>{cancelled=true;void context?.close().catch(()=>{})};
 },[asset.id,asset.source]);
 const width=Math.max(90,duration*fps*3*zoom/100);
 return <div className="timeline-audio-clip" style={{width}} title={asset.name+' • '+duration.toFixed(2)+'s'}>
  <span className="timeline-audio-name">♫ {asset.name}</span>
  <div className="timeline-audio-wave">{peaks.length?peaks.map((v,i)=><i key={i} style={{height:Math.max(3,Math.round(v*30))+'px'}}/>):<small>{error||'Decoding waveform…'}</small>}</div>
 </div>;
}
