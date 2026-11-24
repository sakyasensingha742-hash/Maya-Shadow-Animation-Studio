import type {RhubarbMouthShape} from './rhubarbLipSync';

export type OpenBoneMouthShape='rest'|'closed'|'small'|'open'|'wide'|'round';
export type FaceMouthShape=RhubarbMouthShape|OpenBoneMouthShape;
export type FaceMouthCue={start:number;end:number;value:FaceMouthShape};

/** Approximate slider value for the existing generic mouth-open control. */
export function mouthShapeToOpen(shape:FaceMouthShape):number{
 const values:Record<FaceMouthShape,number>={
  A:0,B:12,C:62,D:92,E:58,F:24,G:38,H:48,X:0,
  rest:0,closed:0,small:18,open:62,wide:92,round:48
 };
 return values[shape];
}
