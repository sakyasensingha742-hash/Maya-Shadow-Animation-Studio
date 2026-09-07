export type BvhChannel='Xposition'|'Yposition'|'Zposition'|'Xrotation'|'Yrotation'|'Zrotation';
export type BvhJoint={name:string;offset:[number,number,number];channels:BvhChannel[];children:BvhJoint[]};
export type BvhMotion={root:BvhJoint;frameCount:number;frameTime:number;fps:number;frames:number[][];duration:number;channelCount:number};

const CHANNELS=new Set<BvhChannel>(['Xposition','Yposition','Zposition','Xrotation','Yrotation','Zrotation']);

export function parseBvh(text:string):BvhMotion{
  const tokens=text.replace(/\r/g,'').split(/\s+/).filter(Boolean);let i=0;
  const next=()=>tokens[i++];
  if((next()||'').toUpperCase()!=='HIERARCHY')throw new Error('BVH hierarchy header missing');
  if((next()||'').toUpperCase()!=='ROOT')throw new Error('BVH root joint missing');
  const parseJoint=(name:string):BvhJoint=>{
    if(next()!=='{')throw new Error(`BVH joint ${name} is missing {`);
    let offset:[number,number,number]=[0,0,0];let channels:BvhChannel[]=[];const children:BvhJoint[]=[];
    while(i<tokens.length){const t=next();if(t==='}')break;
      if(t==='OFFSET'){offset=[Number(next()),Number(next()),Number(next())];continue;}
      if(t==='CHANNELS'){const count=Number(next());channels=[];for(let n=0;n<count;n++){const c=next() as BvhChannel;if(!CHANNELS.has(c))throw new Error(`Unsupported BVH channel ${c}`);channels.push(c)}continue;}
      if(t==='JOINT'){children.push(parseJoint(next()));continue;}
      if(t==='End'){if(next()!=='Site'||next()!=='{')throw new Error('Invalid BVH End Site');while(next()!=='}'&&i<tokens.length){}continue;}
      throw new Error(`Unexpected BVH hierarchy token ${t}`);
    }
    return {name,offset,channels,children};
  };
  const root=parseJoint(next());
  while(i<tokens.length&&(tokens[i]==='MOTION'))i++;
  if((tokens[i++]||'').toLowerCase()!=='frames:')throw new Error('BVH Frames header missing');
  const frameCount=Number(next());
  if((tokens[i++]||'').toLowerCase()!=='frame')throw new Error('BVH Frame Time header missing');
  if((tokens[i++]||'').toLowerCase()!=='time:')throw new Error('BVH Frame Time header missing');
  const frameTime=Number(next());if(!Number.isFinite(frameCount)||frameCount<0||!Number.isFinite(frameTime)||frameTime<=0)throw new Error('Invalid BVH frame metadata');
  const channelCount=(()=>{let total=0;const walk=(j:BvhJoint)=>{total+=j.channels.length;j.children.forEach(walk)};walk(root);return total})();
  const frames:number[][]=[];for(let f=0;f<frameCount;f++){const row:number[]=[];for(let c=0;c<channelCount;c++){const v=Number(next());if(!Number.isFinite(v))throw new Error(`Invalid BVH value at frame ${f+1}`);row.push(v)}frames.push(row)}
  const fps=1/frameTime;return {root,frameCount,frameTime,fps,frames,duration:frameCount/fps,channelCount};
}

export function flattenBvhJoints(root:BvhJoint):BvhJoint[]{const out:BvhJoint[]=[];const walk=(j:BvhJoint)=>{out.push(j);j.children.forEach(walk)};walk(root);return out;}
