export type PluginCategory='character'|'animation'|'fx'|'camera'|'audio'|'import-export'|'workflow'|'ai';
export type PluginPermission='read-project'|'write-project'|'read-assets'|'write-assets'|'render'|'network';

export type StudioPlugin={
  id:string;
  name:string;
  version:string;
  author:string;
  description:string;
  category:PluginCategory;
  permissions:PluginPermission[];
  enabled:boolean;
  installedAt:string;
  source:'builtin'|'local-package';
};

export const pluginCategories:{id:PluginCategory;label:string}[]=[
  {id:'character',label:'Character & Rig'},
  {id:'animation',label:'Animation & Motion'},
  {id:'fx',label:'FX & Environment'},
  {id:'camera',label:'Camera'},
  {id:'audio',label:'Audio & Lip Sync'},
  {id:'import-export',label:'Import / Export'},
  {id:'workflow',label:'Workflow & Productivity'},
  {id:'ai',label:'AI Tools'}
];

export const recommendedPlugins:StudioPlugin[]=[
  {id:'maya-plugin-smart-rig',name:'Smart Rig Assistant',version:'1.0.0',author:'Maya Shadow',description:'Assists with character part detection, rig-map suggestions and common rig setup checks.',category:'character',permissions:['read-assets','write-assets'],enabled:false,installedAt:'',source:'builtin'},
  {id:'maya-plugin-motion-library',name:'Motion Library Pro',version:'1.0.0',author:'Maya Shadow',description:'Adds reusable walk, run, acting, vehicle and emotional motion packs with searchable tags.',category:'animation',permissions:['read-project','write-project'],enabled:false,installedAt:'',source:'builtin'},
  {id:'maya-plugin-fx-nature',name:'Nature FX Pack',version:'1.0.0',author:'Maya Shadow',description:'Wind, rain, lightning, fog, water, dust, smoke and foliage motion presets.',category:'fx',permissions:['read-project','write-project'],enabled:false,installedAt:'',source:'builtin'},
  {id:'maya-plugin-lipsync',name:'Auto Lip Sync',version:'1.0.0',author:'Maya Shadow',description:'Voice-to-mouth timing workflow for Bengali and English dialogue production.',category:'audio',permissions:['read-assets','write-project'],enabled:false,installedAt:'',source:'builtin'},
  {id:'maya-plugin-camera-tools',name:'Cinematic Camera Tools',version:'1.0.0',author:'Maya Shadow',description:'Shot presets, smooth camera moves, follow shots and controlled impact camera motion.',category:'camera',permissions:['read-project','write-project'],enabled:false,installedAt:'',source:'builtin'},
  {id:'maya-plugin-project-tools',name:'Project Productivity Pack',version:'1.0.0',author:'Maya Shadow',description:'Autosave health, project validation, duplicate-scene tools and production checklists.',category:'workflow',permissions:['read-project','write-project'],enabled:false,installedAt:'',source:'builtin'},
  {id:'maya-plugin-media-io',name:'Media Import / Export Pro',version:'1.0.0',author:'Maya Shadow',description:'Safer media relinking, export presets and production-friendly media management.',category:'import-export',permissions:['read-project','read-assets','write-assets','render'],enabled:false,installedAt:'',source:'builtin'},
  {id:'maya-plugin-ai-story',name:'AI Story Assistant',version:'1.0.0',author:'Maya Shadow',description:'Optional AI helpers for storyboard breakdown, shot planning and animation prompt generation.',category:'ai',permissions:['read-project','network'],enabled:false,installedAt:'',source:'builtin'}
];

const STORAGE_KEY='maya-shadow-plugins-v1';

export function loadPlugins():StudioPlugin[]{
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]') as StudioPlugin[]}catch{return []}
}

export function savePlugins(plugins:StudioPlugin[]){localStorage.setItem(STORAGE_KEY,JSON.stringify(plugins))}

export function mergePlugins():StudioPlugin[]{
  const installed=loadPlugins();
  return recommendedPlugins.map(p=>installed.find(x=>x.id===p.id)||p).concat(installed.filter(x=>!recommendedPlugins.some(p=>p.id===x.id)));
}

export function togglePlugin(id:string,enabled:boolean):StudioPlugin[]{
  const all=mergePlugins().map(p=>p.id===id?{...p,enabled,installedAt:p.installedAt||new Date().toISOString()}:p);
  savePlugins(all.filter(p=>p.source==='local-package'||p.enabled));
  return all;
}

export function validatePluginManifest(value:unknown):StudioPlugin|null{
  if(!value||typeof value!=='object')return null;
  const p=value as Partial<StudioPlugin>;
  if(typeof p.id!=='string'||typeof p.name!=='string'||typeof p.version!=='string'||typeof p.author!=='string'||typeof p.description!=='string')return null;
  if(!Array.isArray(p.permissions)||!Array.isArray(p.category))return null;
  return {
    id:`local-${p.id}`,
    name:p.name,
    version:p.version,
    author:p.author,
    description:p.description,
    category:p.category as PluginCategory,
    permissions:(p.permissions as PluginPermission[]).filter(Boolean),
    enabled:false,
    installedAt:new Date().toISOString(),
    source:'local-package'
  };
}
