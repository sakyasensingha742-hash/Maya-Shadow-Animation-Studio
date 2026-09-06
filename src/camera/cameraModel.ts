export type Camera2D={x:number;y:number;zoom:number;rotation:number};
export const defaultCamera:Camera2D={x:0,y:0,zoom:1,rotation:0};
export function cameraStyle(c:Camera2D){return{transform:`translate(${-c.x}px,${-c.y}px) scale(${c.zoom}) rotate(${-c.rotation}deg)`,transformOrigin:'center'}}
