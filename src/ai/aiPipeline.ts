export type AITask = 'character-segmentation' | 'keypoint-detection' | 'rig-suggestion' | 'background-generation' | 'lip-sync' | 'motion-assist';
export type AIRequest = {task: AITask; input: string; options?: Record<string, unknown>};
export type AIResult = {task: AITask; status: 'success'|'needs-review'|'error'; data: unknown; message?: string};

export interface AIProvider {name: string; supports(task:AITask): boolean; run(request:AIRequest): Promise<AIResult>}

export class LocalReviewProvider implements AIProvider {
 name='Local Review Engine';
 supports(task:AITask){return ['character-segmentation','keypoint-detection','rig-suggestion'].includes(task)}
 async run(request:AIRequest):Promise<AIResult>{return {task:request.task,status:'needs-review',data:{input:request.input, suggestions:[]},message:'AI adapter is ready. Connect a model provider to generate production detections; keep manual correction available.'}}
}

export class AIPipeline {
 constructor(private providers:AIProvider[]=[new LocalReviewProvider()]){}
 async run(request:AIRequest){const provider=this.providers.find(p=>p.supports(request.task));if(!provider) return {task:request.task,status:'error' as const,data:null,message:'No provider configured for this task.'};return provider.run(request)}
}
