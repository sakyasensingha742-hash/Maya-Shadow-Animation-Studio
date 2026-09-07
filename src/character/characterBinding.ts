import type {CharacterRig} from '../rigging/rigEngine';
import type {CharacterBinding} from '../project/projectModel';

const KEY='maya-shadow-active-character-binding-v1';
const RIG_PREFIX='maya-shadow-rig-v1-';

export function createCharacterBinding(assetId:string,rig:CharacterRig|null):CharacterBinding|null{
  if(!rig)return null;
  return {assetId,rigId:stableRigId(rig),boundAt:new Date().toISOString()};
}

export function saveCharacterBinding(binding:CharacterBinding|null){
  try{
    if(binding)localStorage.setItem(KEY,JSON.stringify(binding));
    else localStorage.removeItem(KEY);
  }catch{}
  return binding;
}

export function loadCharacterBinding():CharacterBinding|null{
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return null;
    const value=JSON.parse(raw);
    if(typeof value?.assetId!=='string'||typeof value?.rigId!=='string')return null;
    return value as CharacterBinding;
  }catch{return null;}
}

export function bindCharacterToRig(assetId:string,rig:CharacterRig|null):CharacterBinding|null{
  const binding=createCharacterBinding(assetId,rig);
  if(!binding||!rig)return null;
  saveCharacterBinding(binding);
  saveRig(binding.rigId,rig);
  return binding;
}

export function saveRig(rigId:string,rig:CharacterRig){
  try{localStorage.setItem(`${RIG_PREFIX}${rigId}`,JSON.stringify(rig));}catch{}
  return rig;
}

export function loadRig(rigId:string|null|undefined):CharacterRig|null{
  if(!rigId)return null;
  try{
    const raw=localStorage.getItem(`${RIG_PREFIX}${rigId}`);
    if(!raw)return null;
    const value=JSON.parse(raw);
    if(!value||value.version!==1||!Array.isArray(value.bones)||!Array.isArray(value.facialControls))return null;
    return value as CharacterRig;
  }catch{return null;}
}

export function loadBoundRig():CharacterRig|null{
  return loadRig(loadCharacterBinding()?.rigId);
}

export function clearCharacterBinding(){
  const binding=loadCharacterBinding();
  try{
    localStorage.removeItem(KEY);
    if(binding?.rigId)localStorage.removeItem(`${RIG_PREFIX}${binding.rigId}`);
  }catch{}
}

function stableRigId(rig:CharacterRig):string{
  const bones=rig.bones.map(b=>b.id).join('|');
  let hash=2166136261;
  for(let i=0;i<bones.length;i++){hash^=bones.charCodeAt(i);hash=Math.imul(hash,16777619)}
  return `rig-${(hash>>>0).toString(16)}`;
}
