import type {RenderSettings} from './renderModel';
import {validateRenderSettings} from './renderModel';

export type RenderRange={startFrame:number;endFrame:number};

export function validateRenderRange(range:RenderRange,totalFrames:number){
 const errors:string[]=[];
 if(!Number.isInteger(range.startFrame)||range.startFrame<1)errors.push('Start frame must be a positive integer.');
 if(!Number.isInteger(range.endFrame)||range.endFrame<range.startFrame)errors.push('End frame must be greater than or equal to Start frame.');
 if(Number.isFinite(totalFrames)&&totalFrames>0&&range.endFrame>totalFrames)errors.push(`End frame cannot exceed the scene length (${totalFrames}).`);
 return {valid:errors.length===0,errors};
}

export function validateExportRequest(settings:RenderSettings,range:RenderRange,totalFrames:number){
 const settingsResult=validateRenderSettings(settings);
 const rangeResult=validateRenderRange(range,totalFrames);
 return {valid:settingsResult.valid&&rangeResult.valid,errors:[...settingsResult.errors,...rangeResult.errors]};
}
