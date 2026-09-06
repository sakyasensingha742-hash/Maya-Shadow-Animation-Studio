export type RigBone = {
  id: string;
  parentId: string | null;
  length: number;
  rotation: number;
  x: number;
  y: number;
};

export type FacialControl = {
  id: string;
  type: 'eye' | 'eyelid' | 'brow' | 'mouth';
  side?: 'left' | 'right' | 'center';
  value: number;
};

export type CharacterRig = {
  version: 1;
  bones: RigBone[];
  facialControls: FacialControl[];
  generatedAt: string;
};

export const DEFAULT_BONE_IDS = [
  'root','spine','neck','head',
  'upperArmL','lowerArmL','handL','upperArmR','lowerArmR','handR',
  'upperLegL','lowerLegL','footL','upperLegR','lowerLegR','footR',
] as const;

export function buildRigFromMap(points: {id:string;x:number;y:number}[]): CharacterRig {
  const map = new Map(points.map(p => [p.id, p]));
  const pairs: [string,string,string|null][] = [
    ['root','pelvis',null], ['spine','spine','root'], ['neck','neck','spine'], ['head','head','neck'],
    ['upperArmL','l-shoulder','neck'], ['lowerArmL','l-elbow','upperArmL'], ['handL','l-hand','lowerArmL'],
    ['upperArmR','r-shoulder','neck'], ['lowerArmR','r-elbow','upperArmR'], ['handR','r-hand','lowerArmR'],
    ['upperLegL','l-knee','root'], ['lowerLegL','l-knee','upperLegL'], ['footL','l-foot','lowerLegL'],
    ['upperLegR','r-knee','root'], ['lowerLegR','r-knee','upperLegR'], ['footR','r-foot','lowerLegR'],
  ];
  const bones: RigBone[] = pairs.map(([id, source, parentId]) => {
    const p = map.get(source) ?? {x:50,y:50};
    const parent = parentId ? map.get(parentId === 'root' ? 'pelvis' : parentId === 'upperArmL' ? 'l-shoulder' : parentId === 'lowerArmL' ? 'l-elbow' : parentId === 'handL' ? 'l-hand' : parentId === 'upperArmR' ? 'r-shoulder' : parentId === 'lowerArmR' ? 'r-elbow' : parentId === 'handR' ? 'r-hand' : parentId) : undefined;
    const dx = p.x - (parent?.x ?? p.x);
    const dy = p.y - (parent?.y ?? p.y);
    return { id, parentId, x:p.x, y:p.y, length:Math.hypot(dx,dy), rotation:Math.atan2(dy,dx) };
  });
  const facialControls: FacialControl[] = [
    {id:'eye-left',type:'eye',side:'left',value:0},{id:'eye-right',type:'eye',side:'right',value:0},
    {id:'blink-left',type:'eyelid',side:'left',value:0},{id:'blink-right',type:'eyelid',side:'right',value:0},
    {id:'brow-left',type:'brow',side:'left',value:0},{id:'brow-right',type:'brow',side:'right',value:0},
    {id:'mouth-open',type:'mouth',side:'center',value:0},{id:'mouth-smile',type:'mouth',side:'center',value:0},
  ];
  return {version:1,bones,facialControls,generatedAt:new Date().toISOString()};
}
