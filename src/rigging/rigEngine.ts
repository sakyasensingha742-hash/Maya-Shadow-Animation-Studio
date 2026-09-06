export type RigBone = {
  id: string;
  parentId: string | null;
  sourcePointId: string;
  x: number;
  y: number;
  length: number;
  rotation: number;
};

export type FacialControl = {
  id: string;
  type: 'sclera' | 'iris' | 'pupil' | 'eyelid' | 'lash' | 'highlight' | 'brow' | 'mouth';
  side?: 'left' | 'right' | 'center';
  value: number;
};

export type CharacterRig = {
  version: 1;
  bones: RigBone[];
  facialControls: FacialControl[];
  generatedAt: string;
};

export const DEFAULT_BONE_IDS = ['root','spine','neck','head','upperArmL','lowerArmL','handL','upperArmR','lowerArmR','handR','upperLegL','lowerLegL','footL','upperLegR','lowerLegR','footR'] as const;

type Point = {id:string;x:number;y:number};
type Spec = [string,string,string|null,string|null];

const specs: Spec[] = [
  ['root','pelvis',null,null], ['spine','spine','root','pelvis'], ['neck','neck','spine','spine'], ['head','head','neck','neck'],
  ['upperArmL','l-shoulder','neck','neck'], ['lowerArmL','l-elbow','upperArmL','l-shoulder'], ['handL','l-hand','lowerArmL','l-elbow'],
  ['upperArmR','r-shoulder','neck','neck'], ['lowerArmR','r-elbow','upperArmR','r-shoulder'], ['handR','r-hand','lowerArmR','r-elbow'],
  ['upperLegL','l-knee','root','pelvis'], ['lowerLegL','l-foot','upperLegL','l-knee'], ['footL','l-foot','lowerLegL','l-foot'],
  ['upperLegR','r-knee','root','pelvis'], ['lowerLegR','r-foot','upperLegR','r-knee'], ['footR','r-foot','lowerLegR','r-foot'],
];

export function buildRigFromMap(points: Point[]): CharacterRig {
  const map = new Map(points.map(p => [p.id, p]));
  const point = (id: string) => map.get(id) ?? {id, x:50, y:50};
  const bones = specs.map(([id, sourceId, parentId, parentPointId]) => {
    const p = point(sourceId), parent = parentPointId ? point(parentPointId) : p;
    const dx = p.x - parent.x, dy = p.y - parent.y;
    return {id, parentId, sourcePointId:sourceId, x:p.x, y:p.y, length:Math.hypot(dx,dy), rotation:Math.atan2(dy,dx)};
  });
  const facialControls: FacialControl[] = [
    {id:'sclera-left',type:'sclera',side:'left',value:1},{id:'iris-left',type:'iris',side:'left',value:0},{id:'pupil-left',type:'pupil',side:'left',value:0},
    {id:'upper-lid-left',type:'eyelid',side:'left',value:0},{id:'lower-lid-left',type:'eyelid',side:'left',value:0},{id:'lash-left',type:'lash',side:'left',value:1},{id:'highlight-left',type:'highlight',side:'left',value:1},{id:'brow-left',type:'brow',side:'left',value:0},
    {id:'sclera-right',type:'sclera',side:'right',value:1},{id:'iris-right',type:'iris',side:'right',value:0},{id:'pupil-right',type:'pupil',side:'right',value:0},
    {id:'upper-lid-right',type:'eyelid',side:'right',value:0},{id:'lower-lid-right',type:'eyelid',side:'right',value:0},{id:'lash-right',type:'lash',side:'right',value:1},{id:'highlight-right',type:'highlight',side:'right',value:1},{id:'brow-right',type:'brow',side:'right',value:0},
    {id:'mouth-open',type:'mouth',side:'center',value:0},{id:'mouth-smile',type:'mouth',side:'center',value:0},
  ];
  return {version:1,bones,facialControls,generatedAt:new Date().toISOString()};
}
