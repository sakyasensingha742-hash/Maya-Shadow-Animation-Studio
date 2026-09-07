export type ScenePlan={version:1;character:string;background:string;props:string[];vehicle:string;updatedAt:string};
const KEY='maya-shadow-scene-plan-v1';
export function saveScenePlan(plan:Omit<ScenePlan,'version'|'updatedAt'>):ScenePlan{const value:ScenePlan={...plan,version:1,updatedAt:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(value))}catch{}return value}
export function loadScenePlan():ScenePlan|null{try{const raw=localStorage.getItem(KEY);if(!raw)return null;const value=JSON.parse(raw);if(value?.version!==1||typeof value.character!=='string'||typeof value.background!=='string'||!Array.isArray(value.props)||typeof value.vehicle!=='string')return null;return value as ScenePlan}catch{return null}}
export function clearScenePlan(){try{localStorage.removeItem(KEY)}catch{}}
