import {Asset,CharacterBinding} from '../project/projectModel';
import {CharacterRig} from '../rigging/rigEngine';

export type CharacterReplacementResult={assets:Asset[];image:string;preservedRig:boolean;preservedTimeline:boolean};

/** Replace the active character asset without touching rig/timeline state. */
export function replaceCharacterAsset(assets:Asset[],replacement:Asset,image:string):CharacterReplacementResult{
 const next=assets.filter(asset=>asset.type!=='character');
 next.push(replacement);
 return {assets:next,image,preservedRig:true,preservedTimeline:true};
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
