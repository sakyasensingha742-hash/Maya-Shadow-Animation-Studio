import {Asset,CharacterBinding} from '../project/projectModel';
import {CharacterRig} from '../rigging/rigEngine';

export type CharacterReplacementResult={assets:Asset[];image:string;preservedRig:boolean;preservedTimeline:boolean};
const ACTIVE_CHARACTER_KEY='maya-shadow-active-character-asset-v1';

/** Replace the active character asset without touching rig/timeline state. */
export function replaceCharacterAsset(assets:Asset[],replacement:Asset,image:string):CharacterReplacementResult{
 const next=assets.filter(asset=>asset.type!=='character');
 next.push(replacement);
 try{localStorage.setItem(ACTIVE_CHARACTER_KEY,replacement.id)}catch{}
 return {assets:next,image,preservedRig:true,preservedTimeline:true};
}

export function loadActiveCharacterAssetId():string|null{
 try{return localStorage.getItem(ACTIVE_CHARACTER_KEY)}catch{return null}
}

/** Create the persistent relationship between the active character asset and rig. */
export function bindCharacterToRig(asset:Asset,rig:CharacterRig):CharacterBinding{
 const bones=rig.bones.map(b=>b.id).join('|');
 let hash=2166136261;
 for(let i=0;i<bones.length;i++){hash^=bones.charCodeAt(i);hash=Math.imul(hash,16777619)}
 return {assetId:asset.id,rigId:`rig-${(hash>>>0).toString(16)}`,boundAt:new Date().toISOString()};
}

/** Rebind a replacement character to the existing rig while preserving animation tracks. */
export function rebindReplacementToRig(assets:Asset[],replacement:Asset,rig:CharacterRig|null,previousBinding?:CharacterBinding):{assets:Asset[];binding:CharacterBinding|undefined;preservedTimeline:boolean}{
 const next=replaceCharacterAsset(assets,replacement,replacement.source).assets;
 if(!rig)return {assets:next,binding:previousBinding,preservedTimeline:true};
 return {assets:next,binding:bindCharacterToRig(replacement,rig),preservedTimeline:true};
}

/** Compatibility guard used by the replacement workflow: a swap never mutates the rig object. */
export function canPreserveRig(previousRig:CharacterRig|null):boolean{return previousRig!==null;}
