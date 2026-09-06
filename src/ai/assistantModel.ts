export type AssistantAction={label:string;message:string;workspace?:string;action?:'import-character'|'open-character'|'open-background'|'open-audio'|'open-drawing'|'preview'};

export function assistantReply(input:string):{reply:string;actions:AssistantAction[]} {
 const q=input.toLowerCase();
 if(q.includes('rig')||q.includes('character')||q.includes('bone')) return {reply:'আমি আপনার character rigging-এর ধাপগুলো সহজ করে দিতে পারি। আগে character image import করুন, তারপর Auto Rig Map থেকে points ঠিক করে Create Rig চাপুন।',actions:[{label:'Character খুলুন',message:'Character workspace খুলুন',workspace:'Character',action:'open-character'}]};
 if(q.includes('background')||q.includes('bg')) return {reply:'Background তৈরি বা import করতে Background workspace ব্যবহার করুন। আমি আপনাকে scene-এর জন্য suitable background workflow দেখাতে পারি।',actions:[{label:'Background খুলুন',message:'Background workspace খুলুন',workspace:'Background',action:'open-background'}]};
 if(q.includes('audio')||q.includes('voice')||q.includes('sound')) return {reply:'Voice বা music যোগ করতে Audio/Video workspace-এ media import করুন। তারপর timeline-এ sync করতে পারবেন।',actions:[{label:'Audio/Video খুলুন',message:'Audio/Video workspace খুলুন',workspace:'Audio/Video',action:'open-audio'}]};
 if(q.includes('draw')||q.includes('drawing')) return {reply:'নিজে আঁকতে Drawing Studio ব্যবহার করুন। Brush, Pen, Eraser এবং basic shape tools দিয়ে শুরু করতে পারবেন।',actions:[{label:'Drawing খুলুন',message:'Drawing workspace খুলুন',workspace:'Drawing',action:'open-drawing'}]};
 if(q.includes('animate')||q.includes('animation')||q.includes('keyframe')) return {reply:'Animation-এর জন্য frame select করে object/rig pose বদলান এবং ◆ Keyframe দিন। Preview চাপলে motion পরীক্ষা করতে পারবেন।',actions:[{label:'Preview',message:'Animation preview চালু করুন',action:'preview'}]};
 return {reply:'আমি Maya Shadow Studio-তে আপনার সহকারী। আপনি বাংলায় বলুন—যেমন “character rig করব”, “background যোগ করব”, “voice বসাব”, “animation বানাব” বা “কীভাবে শুরু করব?” আমি ধাপে ধাপে সাহায্য করব।',actions:[{label:'শুরু করি',message:'শুরু করার workflow দেখাও',workspace:'Animation'}]};
}
