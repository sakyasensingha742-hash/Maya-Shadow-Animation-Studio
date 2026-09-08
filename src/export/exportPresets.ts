export type SocialExportPreset={name:string;width:number;height:number;fps:number;ratio:string;platform:string};

export const socialExportPresets:readonly SocialExportPreset[]=[
 {name:'YouTube 4K',width:3840,height:2160,fps:30,ratio:'16:9',platform:'YouTube'},
 {name:'YouTube Shorts 4K',width:2160,height:3840,fps:30,ratio:'9:16',platform:'YouTube Shorts'},
 {name:'Instagram Reels 4K',width:2160,height:3840,fps:30,ratio:'9:16',platform:'Instagram Reels'},
 {name:'Facebook Video 1080p',width:1920,height:1080,fps:30,ratio:'16:9',platform:'Facebook'},
 {name:'Instagram Square 4K',width:3840,height:3840,fps:30,ratio:'1:1',platform:'Instagram'},
 {name:'Cinema 4K',width:3840,height:2160,fps:24,ratio:'16:9',platform:'Cinema'}
] as const;

export function getSocialPreset(name:string){return socialExportPresets.find(p=>p.name===name)||null;}
