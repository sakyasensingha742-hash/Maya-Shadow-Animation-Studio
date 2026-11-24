/** Rhubarb Lip Sync cue-file interoperability (JSON, XML and TSV).
 * Parses exported cues only; it does not bundle or run the audio recognizer.
 * Rhubarb project: https://github.com/DanielSWolf/rhubarb-lip-sync (MIT).
 */
export type RhubarbMouthShape = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'X';
export type RhubarbMouthCue = {start:number;end:number;value:RhubarbMouthShape};
const SHAPES = new Set<RhubarbMouthShape>(['A','B','C','D','E','F','G','H','X']);
const isShape = (v:unknown):v is RhubarbMouthShape => typeof v==='string' && SHAPES.has(v as RhubarbMouthShape);
function validCue(start:unknown,end:unknown,value:unknown):RhubarbMouthCue {
 const a=Number(start),b=Number(end);
 if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=a||!isShape(value)) throw new Error('Invalid Rhubarb cue: expected a non-negative start, a later end and a shape A–H or X.');
 return {start:a,end:b,value};
}
function parseJson(text:string):RhubarbMouthCue[] {
 const data=JSON.parse(text) as {mouthCues?:Array<{start?:unknown;end?:unknown;value?:unknown}>};
 if(!Array.isArray(data.mouthCues)) throw new Error('Rhubarb JSON does not contain a mouthCues array.');
 return data.mouthCues.map(c=>validCue(c.start,c.end,c.value)).sort((a,b)=>a.start-b.start);
}
function parseXml(text:string):RhubarbMouthCue[] {
 const re=/<mouthCue\s+start=["']([^"']+)["']\s+end=["']([^"']+)["']\s*>([A-HX])\s*<\/mouthCue>/gi;
 const cues:RhubarbMouthCue[]=[];
 for(const m of text.matchAll(re)) cues.push(validCue(m[1],m[2],m[3].toUpperCase()));
 if(!cues.length) throw new Error('No Rhubarb mouthCue elements found in XML.');
 return cues.sort((a,b)=>a.start-b.start);
}
function parseTsv(text:string):RhubarbMouthCue[] {
 const events:Array<{time:number;value:RhubarbMouthShape}>=[];
 for(const line of text.split(/\r?\n/)){
  const m=line.trim().match(/^([0-9]+(?:\.[0-9]+)?)\s+([A-HX])$/i);
  if(!m) continue;
  const time=Number(m[1]),value=m[2].toUpperCase();
  if(Number.isFinite(time)&&time>=0&&isShape(value)) events.push({time,value});
 }
 if(events.length<2) throw new Error('No Rhubarb TSV cue sequence found. Expected timestamp + mouth-shape rows.');
 events.sort((a,b)=>a.time-b.time);
 const cues:RhubarbMouthCue[]=[];
 for(let i=0;i<events.length-1;i++) if(events[i+1].time>events[i].time) cues.push(validCue(events[i].time,events[i+1].time,events[i].value));
 if(!cues.length) throw new Error('Rhubarb TSV contains no non-zero cue durations.');
 return cues;
}
/** Detect JSON/XML by content, otherwise parse documented timestamp/shape TSV rows. */
export function parseRhubarbLipSync(text:string,fileName=''):RhubarbMouthCue[] {
 const source=text.trim();
 if(!source) throw new Error('The lip-sync cue file is empty.');
 const name=fileName.toLowerCase();
 if(name.endsWith('.json')||source.startsWith('{')) return parseJson(source);
 if(name.endsWith('.xml')||source.startsWith('<')) return parseXml(source);
 return parseTsv(source);
}
/** Approximate value for the generic mouth-open preview; exact shape is stored too. */
export function rhubarbShapeToMouthOpen(shape:RhubarbMouthShape):number {
 const values:Record<RhubarbMouthShape,number>={A:0,B:12,C:62,D:92,E:58,F:24,G:38,H:48,X:0};
 return values[shape];
}
