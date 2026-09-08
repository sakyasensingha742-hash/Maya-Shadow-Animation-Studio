export type SocialPreset={id:string;name:string;width:number;height:number;fps:number;format:'mp4'|'webm';description:string};

/** Production-ready delivery presets for common social/video destinations. */
export const socialPresets:SocialPreset[]=[
 {id:'youtube-4k',name:'YouTube 4K',width:3840,height:2160,fps:30,format:'mp4',description:'4K UHD landscape for long-form YouTube videos'},
 {id:'youtube-shorts-4k',name:'YouTube Shorts 4K',width:2160,height:3840,fps:30,format:'mp4',description:'Vertical 9:16 delivery for Shorts'},
 {id:'instagram-reels-4k',name:'Instagram Reels 4K',width:2160,height:3840,fps:30,format:'mp4',description:'Vertical 9:16 delivery for Reels'},
 {id:'instagram-square-4k',name:'Instagram Square 4K',width:3840,height:3840,fps:30,format:'mp4',description:'Square 1:1 social delivery'},
 {id:'facebook-hd',name:'Facebook HD',width:1920,height:1080,fps:30,format:'mp4',description:'Full HD landscape social delivery'},
 {id:'cinema-4k',name:'Cinema 4K',width:3840,height:2160,fps:24,format:'mp4',description:'24 fps 4K cinematic delivery'},
 {id:'transparent-webm',name:'Transparent WebM',width:1920,height:1080,fps:30,format:'webm',description:'Alpha-capable WebM for compositing and overlays'}
];

export function getSocialPreset(id:string):SocialPreset|undefined{return socialPresets.find(p=>p.id===id)}
