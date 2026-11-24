import {readPsd} from 'ag-psd';
import type {Layer,Psd} from 'ag-psd';

export type ImportedPsdLayer={
 name:string;groupPath:string[];source:string;left:number;top:number;width:number;height:number;
 visible:boolean;opacity:number;blendMode:'normal'|'multiply'|'screen'|'add'|'overlay';
};
export type ImportedPsdGroup={name:string;path:string[];visible:boolean};
export type ImportedPsdDocument={width:number;height:number;layers:ImportedPsdLayer[];groups:ImportedPsdGroup[]};

function clamp01(value:number){return Math.max(0,Math.min(1,value))}
function blendModeOf(value:string|undefined):ImportedPsdLayer['blendMode']{
 switch(value){case 'multiply':return 'multiply';case 'screen':return 'screen';case 'overlay':return 'overlay';case 'linearDodge':case 'add':return 'add';default:return 'normal'}
}
function layerSource(layer:Layer):{source:string;width:number;height:number}|null{
 const pixels=layer.imageData;
 if(pixels){
  const {width,height}=pixels;
  if(width<1||height<1||pixels.data.length!==width*height*4)return null;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d');if(!context)return null;
  context.putImageData(new ImageData(new Uint8ClampedArray(pixels.data),width,height),0,0);
  return{source:canvas.toDataURL('image/png'),width,height};
 }
 if(layer.canvas)return{source:layer.canvas.toDataURL('image/png'),width:layer.canvas.width,height:layer.canvas.height};
 return null;
}

/**
 * Reads editable PSD pixel layers. Initial scope: 8-bit RGB documents.
 * Masks, adjustment layers, layer effects and advanced group blending aren't composited.
 */
export async function importLayeredPsd(file:File):Promise<ImportedPsdDocument>{
 if(!file.name.toLowerCase().endsWith('.psd'))throw new Error('Choose a Photoshop .psd file.');
 const parsed=readPsd(await file.arrayBuffer(),{useImageData:true,skipCompositeImageData:true,skipThumbnail:true,skipLinkedFilesData:true,logMissingFeatures:true}) as Psd;
 if(parsed.bitsPerChannel!==8)throw new Error('This importer currently supports 8-bit PSD documents only.');
 if(parsed.colorMode!==3)throw new Error('This importer currently supports RGB PSD documents only. Convert CMYK, Grayscale or Indexed artwork to RGB first.');
 if(!parsed.width||!parsed.height||parsed.width>30000||parsed.height>30000)throw new Error('The PSD canvas dimensions are invalid or too large.');
 const layers:ImportedPsdLayer[]=[];const groups:ImportedPsdGroup[]=[];
 const walk=(children:Layer[],path:string[],parentOpacity:number):void=>{
  for(const layer of children){
   const name=(layer.name||'Untitled Layer').trim()||'Untitled Layer';
   const localOpacity=clamp01((layer.opacity??255)/255);
   const visible=!Boolean(layer.hidden);
   if(layer.children){
    const groupPath=[...path,name];
    groups.push({name,path:groupPath,visible});
    walk(layer.children,groupPath,parentOpacity*localOpacity);
    continue;
   }
   const bitmap=layerSource(layer);if(!bitmap)continue;
   layers.push({name,groupPath:[...path],source:bitmap.source,left:layer.left??0,top:layer.top??0,width:bitmap.width,height:bitmap.height,visible,opacity:Math.round(parentOpacity*localOpacity*100),blendMode:blendModeOf(layer.blendMode)});
  }
 };
 walk(parsed.children||[],[],1);
 if(!layers.length)throw new Error('No pixel artwork layers were found. The PSD may contain only vector/text/effect layers or unsupported data.');
 return{width:parsed.width,height:parsed.height,layers,groups};
}
