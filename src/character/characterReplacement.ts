import {Asset} from '../project/projectModel';
import {CharacterRig} from '../rigging/rigEngine';

export type CharacterReplacementResult={
  assets:Asset[];
  image:string;
  preservedRig:boolean;
  preservedTimeline:boolean;
};

/** Replace the active character asset without touching rig/timeline state. */
export function replaceCharacterAsset(assets:Asset[],replacement:Asset,image:string):CharacterReplacementResult{
  const next=assets.filter(asset=>asset.type!=='character');
  next.push(replacement);
  return {assets:next,image,preservedRig:true,preservedTimeline:true};
}

/** Compatibility guard used by the replacement workflow: a swap never mutates the rig object. */
export function canPreserveRig(previousRig:CharacterRig|null):boolean{
  return previousRig!==null;
}
