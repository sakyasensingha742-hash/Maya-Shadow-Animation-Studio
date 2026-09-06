export type PresetCategory='character'|'background'|'animation'|'fx'|'camera'|'voice';

export type StudioPreset={
  id:string;
  name:string;
  category:PresetCategory;
  description:string;
  tags:string[];
  source?:string;
  sourceType?:'image'|'json'|'builtin';
  createdAt:string;
  updatedAt:string;
  builtIn?:boolean;
};

export const presetCategories: {id:PresetCategory;label:string;icon:string}[]=[
  {id:'character',label:'Characters',icon:'◉'},
  {id:'background',label:'Backgrounds',icon:'▣'},
  {id:'animation',label:'Animations',icon:'▶'},
  {id:'fx',label:'FX & Effects',icon:'✦'},
  {id:'camera',label:'Camera',icon:'⌖'},
  {id:'voice',label:'Voice',icon:'♫'}
];

const now='2026-09-06T00:00:00.000Z';
export const builtInPresets:StudioPreset[]=[
  {id:'builtin-character-bengali-male',name:'Bengali Young Male',category:'character',description:'Starter character slot for Bengali 2D/2.5D productions.',tags:['bengali','male','2.5d','starter'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-character-bengali-female',name:'Bengali Young Female',category:'character',description:'Starter character slot for Bengali 2D/2.5D productions.',tags:['bengali','female','2.5d','starter'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-character-child',name:'Village Child',category:'character',description:'Friendly child character preset for story animation.',tags:['child','village','story'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-background-village',name:'Bengal Village Courtyard',category:'background',description:'Warm rural Bengal courtyard environment.',tags:['village','bengal','day','rural'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-background-river',name:'Riverbank Evening',category:'background',description:'Quiet riverbank setup for emotional or mystery scenes.',tags:['river','evening','cinematic'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-background-room',name:'Rural House Interior',category:'background',description:'Traditional Bengali home interior starter preset.',tags:['room','rural','interior'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-animation-breathe',name:'Natural Idle / Breathing',category:'animation',description:'Subtle idle movement preset for characters.',tags:['idle','breathing','loop'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-animation-walk',name:'Simple Walk Cycle',category:'animation',description:'Starter walk-cycle motion preset.',tags:['walk','cycle','motion'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-animation-talk',name:'Talking Idle',category:'animation',description:'Gentle body movement suitable for dialogue scenes.',tags:['talk','dialogue','idle'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-fx-wind',name:'Soft Wind',category:'fx',description:'Preset concept for subtle wind movement.',tags:['wind','nature','subtle'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-fx-rain',name:'Rain Atmosphere',category:'fx',description:'Preset concept for rain ambience.',tags:['rain','weather','atmosphere'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-camera-cinematic',name:'Cinematic Push In',category:'camera',description:'Starter camera move for emotional reveals.',tags:['camera','zoom','cinematic'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true},
  {id:'builtin-voice-dialogue',name:'Dialogue / Lip Sync Setup',category:'voice',description:'Starter voice workflow preset for dialogue scenes.',tags:['voice','dialogue','lip-sync'],sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true}
];

export function loadCustomPresets():StudioPreset[]{
  try{return JSON.parse(localStorage.getItem('maya-shadow-presets')||'[]')}catch{return []}
}
export function saveCustomPresets(presets:StudioPreset[]){localStorage.setItem('maya-shadow-presets',JSON.stringify(presets))}
