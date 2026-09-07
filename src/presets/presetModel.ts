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

export const presetCategories:{id:PresetCategory;label:string;icon:string}[]=[
  {id:'character',label:'Characters',icon:'◉'},
  {id:'background',label:'Backgrounds',icon:'▣'},
  {id:'animation',label:'Animation & Story',icon:'▶'},
  {id:'fx',label:'FX & Effects',icon:'✦'},
  {id:'camera',label:'Camera',icon:'⌖'},
  {id:'voice',label:'Voice & Lip Sync',icon:'♫'}
];

const now='2026-09-07T00:00:00.000Z';
const p=(id:string,name:string,category:PresetCategory,description:string,tags:string[]):StudioPreset=>({id:`builtin-${id}`,name,category,description,tags,sourceType:'builtin',createdAt:now,updatedAt:now,builtIn:true});

// Offline starter library. These are workflow/preset definitions, not copyrighted asset packs.
// The library is intentionally broad so new local/AI asset packs can be added later without changing the project format.
export const builtInPresets:StudioPreset[]=[
 p('character-bengali-male','Bengali Young Male','character','Production-ready male character slot for Bengali 2D/2.5D stories. Supports rig, face and replacement workflow.',['bengali','male','2.5d','rig','replace']),
 p('character-bengali-female','Bengali Young Female','character','Female character slot for dialogue, emotional and family stories.',['bengali','female','2.5d','rig','dialogue']),
 p('character-child','Village Child','character','Child character slot for moral, village and family stories.',['child','village','moral','story']),
 p('character-elder','Village Elder','character','Elder character slot for narration, folklore and moral stories.',['elder','village','folk','moral']),
 p('character-mother','Mother Character','character','Mother/family character slot with emotional dialogue workflow.',['mother','family','emotion','dialogue']),
 p('character-father','Father Character','character','Father character slot for family and moral-story scenes.',['father','family','moral']),
 p('character-teacher','Teacher Character','character','Teacher slot for school, moral and educational stories.',['teacher','school','moral']),
 p('character-shopkeeper','Shopkeeper Character','character','Shopkeeper slot for market and roadside scenes.',['shopkeeper','market','stall']),
 p('character-villager-male','Village Man','character','General-purpose village male slot.',['villager','male','village']),
 p('character-villager-female','Village Woman','character','General-purpose village female slot.',['villager','female','village']),
 p('character-ghost','Ghost Story Character','character','Stylized supernatural character slot for horror stories.',['horror','ghost','supernatural']),
 p('character-shadow','Shadow Entity','character','Mysterious shadow entity slot for suspense and horror reveals.',['horror','shadow','mystery']),
 p('character-police','Police Character','character','Police character slot for mystery and investigation stories.',['police','mystery','investigation']),
 p('character-doctor','Doctor Character','character','Doctor character slot for hospital and family-story scenes.',['doctor','hospital','story']),
 p('character-driver','Driver Character','character','Driver slot for vehicle scenes and travel sequences.',['driver','vehicle','travel']),

 p('background-bengal-village','Bengal Village Courtyard','background','Warm rural Bengal courtyard environment with room for characters, props and vehicles.',['village','bengal','courtyard','day']),
 p('background-river','Riverbank Evening','background','Riverbank setup for emotional, mystery and horror scenes.',['river','evening','cinematic','horror']),
 p('background-room','Rural House Interior','background','Traditional Bengali home interior starter environment.',['room','rural','interior','family']),
 p('background-night-village','Village Night','background','Dark village environment for suspense and horror stories.',['village','night','horror','mystery']),
 p('background-haunted-house','Haunted House Exterior','background','Atmospheric haunted-house environment for supernatural scenes.',['haunted','house','horror','night']),
 p('background-forest','Bengal Forest Path','background','Forest path for adventure, moral and horror sequences.',['forest','path','adventure','horror']),
 p('background-school','Village School','background','Simple village school environment for educational and moral stories.',['school','village','education']),
 p('background-market','Village Market','background','Market environment with space for stalls, people and vehicles.',['market','stall','crowd','vehicle']),
 p('background-tea-stall','Roadside Tea Stall','background','Roadside tea-stall setup designed for multi-character dialogue scenes.',['tea','stall','road','dialogue']),
 p('background-bus-stop','Village Bus Stop','background','Bus-stop environment for travel and story transitions.',['bus','stop','travel','village']),
 p('background-field','Paddy Field','background','Open rural field for walking, emotional and establishing shots.',['field','paddy','rural','wide']),
 p('background-temple-road','Village Temple Road','background','Traditional village road near a temple for folklore and moral stories.',['temple','road','folk','village']),

 p('animation-breathe','Natural Idle / Breathing','animation','Subtle idle breathing and micro-motion loop.',['idle','breathing','loop','character']),
 p('animation-walk','Simple Walk Cycle','animation','Starter walk-cycle motion preset.',['walk','cycle','motion']),
 p('animation-walk-slow','Slow Emotional Walk','animation','Weighted slow walk for sad or emotional scenes.',['walk','slow','emotion']),
 p('animation-run','Run Cycle','animation','Fast run cycle for chase and action scenes.',['run','cycle','action']),
 p('animation-talk','Talking Idle','animation','Natural body movement for dialogue scenes.',['talk','dialogue','idle']),
 p('animation-talk-emotional','Emotional Dialogue','animation','Head, shoulder and body accents for emotional dialogue.',['dialogue','emotion','acting']),
 p('animation-angry','Angry Acting','animation','Aggressive gestures, posture and head accents for conflict.',['angry','acting','dialogue']),
 p('animation-cry','Crying Acting','animation','Subtle shaking, head drop and emotional body performance.',['cry','sad','emotion']),
 p('animation-laugh','Laughing Acting','animation','Natural laughter body performance and facial timing.',['laugh','acting','face']),
 p('animation-shock','Shock Reaction','animation','Fast reaction pose with delayed recovery.',['shock','reaction','timing']),
 p('animation-fear','Fear Reaction','animation','Fear performance with recoil, tremble and look-around timing.',['fear','horror','reaction']),
 p('animation-scream','Horror Scream','animation','High-energy scream performance preset for horror scenes.',['scream','horror','acting']),
 p('animation-fall','Trip / Fall','animation','Character stumble and fall sequence.',['fall','action','body']),
 p('animation-pickup','Pick Up Object','animation','Reusable interaction timing for picking up props.',['prop','interaction','pickup']),
 p('animation-point','Point / Gesture','animation','Dialogue gesture for pointing at people, places or objects.',['gesture','point','dialogue']),
 p('animation-wave','Wave / Greeting','animation','Friendly greeting hand and body gesture.',['wave','greeting','gesture']),
 p('animation-enter','Scene Entrance','animation','Character entrance from left/right with staging.',['entrance','staging','character']),
 p('animation-exit','Scene Exit','animation','Character exit with configurable direction.',['exit','staging','character']),
 p('animation-vehicle-enter','Vehicle Enter / Exit','animation','Reusable vehicle interaction timing for entering and leaving vehicles.',['vehicle','enter','exit','interaction']),
 p('animation-cart','Bullock Cart Travel','animation','Village bullock-cart travel sequence with wheel and body motion.',['bullock-cart','vehicle','village','travel']),
 p('animation-bike','Motorbike Travel','animation','Two-wheeler travel sequence for roadside stories.',['bike','vehicle','travel']),
 p('animation-car','Car Travel','animation','Car arrival, stop and departure staging.',['car','vehicle','travel']),
 p('animation-bus','Bus Arrival','animation','Bus approach, stop and departure sequence.',['bus','vehicle','travel']),
 p('animation-crowd','Crowd Walk Loop','animation','Loopable multi-character crowd movement concept.',['crowd','loop','village']),
 p('animation-camera-reveal','Character Reveal','animation','Staged reveal using character entrance and camera timing.',['reveal','camera','story']),
 p('animation-horror-reveal','Horror Reveal','animation','Slow suspense reveal with hold, recoil and impact beat.',['horror','reveal','suspense']),
 p('animation-moral-reveal','Moral Story Reveal','animation','Gentle reveal and reaction timing for moral-story lessons.',['moral','reveal','story']),

 p('fx-wind','Soft Wind','fx','Subtle wind movement for trees, cloth and environmental layers.',['wind','nature','subtle']),
 p('fx-strong-wind','Storm Wind','fx','Strong wind timing for storm and horror scenes.',['wind','storm','horror']),
 p('fx-rain','Rain Atmosphere','fx','Rain ambience timing for background and foreground layers.',['rain','weather','atmosphere']),
 p('fx-heavy-rain','Heavy Rain','fx','Dense rain and splash timing for dramatic scenes.',['rain','heavy','drama']),
 p('fx-lightning','Lightning Flash','fx','Timed lightning flash effect for storm/horror scenes.',['lightning','storm','horror']),
 p('fx-fog','Cinematic Fog','fx','Layered fog movement for mystery and horror.',['fog','mystery','horror']),
 p('fx-dust','Dust / Road Particles','fx','Roadside dust movement for walking and vehicle shots.',['dust','road','vehicle']),
 p('fx-smoke','Smoke Atmosphere','fx','Soft smoke movement for fires, rooms and mystery scenes.',['smoke','atmosphere']),
 p('fx-ghost-glow','Supernatural Glow','fx','Ghostly glow timing for supernatural characters.',['ghost','glow','horror']),
 p('fx-shadow-flicker','Shadow Flicker','fx','Unstable shadow/light movement for suspense shots.',['shadow','flicker','horror']),
 p('fx-fire','Fire / Lamp Flicker','fx','Warm flicker timing for lamps, lanterns and firelight.',['fire','lamp','flicker']),
 p('fx-river','River Water Movement','fx','Continuous water motion for river and pond backgrounds.',['water','river','loop']),

 p('camera-cinematic','Cinematic Push In','camera','Slow camera push for emotional reveals.',['camera','zoom','cinematic']),
 p('camera-pull-out','Cinematic Pull Out','camera','Reveal environment by pulling away from the subject.',['camera','zoom','reveal']),
 p('camera-pan','Smooth Pan','camera','Horizontal pan for village roads and establishing shots.',['camera','pan','establishing']),
 p('camera-follow','Character Follow','camera','Follow character during walking or travel.',['camera','follow','walk']),
 p('camera-shake','Horror Impact Shake','camera','Controlled impact shake for horror beats.',['camera','shake','horror']),
 p('camera-dolly','Dolly Through Scene','camera','Depth-oriented camera move through layered backgrounds.',['camera','dolly','2.5d']),
 p('camera-dialogue','Dialogue Shot','camera','Clean medium shot staging for two-character dialogue.',['camera','dialogue','shot']),
 p('camera-wide','Story Establishing Wide','camera','Wide establishing shot for story locations.',['camera','wide','story']),

 p('voice-dialogue','Dialogue / Lip Sync Setup','voice','Starter voice workflow for dialogue scenes.',['voice','dialogue','lip-sync']),
 p('voice-male','Male Dialogue Performance','voice','Voice timing preset for male dialogue scenes.',['voice','male','dialogue']),
 p('voice-female','Female Dialogue Performance','voice','Voice timing preset for female dialogue scenes.',['voice','female','dialogue']),
 p('voice-horror','Horror Voice Performance','voice','Breath, pause and emphasis timing for horror narration.',['voice','horror','narration']),
 p('voice-moral','Moral Story Narration','voice','Warm narration timing for moral and family stories.',['voice','moral','narration']),
 p('voice-ambient','Ambient Story Mix','voice','Dialogue/ambience balance starter for story production.',['audio','ambient','mix'])
];

export function loadCustomPresets():StudioPreset[]{try{return JSON.parse(localStorage.getItem('maya-shadow-presets')||'[]')}catch{return []}}
export function saveCustomPresets(presets:StudioPreset[]){localStorage.setItem('maya-shadow-presets',JSON.stringify(presets))}
