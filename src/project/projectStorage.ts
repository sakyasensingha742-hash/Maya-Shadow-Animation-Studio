import type {StudioProject} from './projectModel';

const DB='maya-shadow-studio';
const STORE='snapshots';
const KEEP=5;

type Snapshot={id:string;project:StudioProject;createdAt:string};

function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}

export async function saveRecoverySnapshot(project:StudioProject){
 if(typeof indexedDB==='undefined')return;
 const db=await openDb();
 await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({id:`snapshot-${Date.now()}`,project,createdAt:new Date().toISOString()});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});
 const all=await listRecoverySnapshots();
 for(const old of all.slice(KEEP)) await deleteRecoverySnapshot(old.id);
 db.close();
}

export async function listRecoverySnapshots():Promise<Snapshot[]>{
 if(typeof indexedDB==='undefined')return [];
 const db=await openDb();
 return await new Promise<Snapshot[]>((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).getAll();req.onsuccess=()=>{db.close();resolve((req.result as Snapshot[]).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)))};req.onerror=()=>{db.close();reject(req.error)}});
}

export async function loadLatestRecoverySnapshot():Promise<StudioProject|null>{
 try{const snapshots=await listRecoverySnapshots();const latest=snapshots[0];return latest?.project?migrateProject(latest.project):null}catch{return null}
}

export async function deleteRecoverySnapshot(id:string){
 if(typeof indexedDB==='undefined')return;
 const db=await openDb();
 await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close();
}

export function migrateProject(input:Partial<StudioProject>|null|undefined):StudioProject{
 const fresh=structuredCloneSafe(createFallback());
 if(!input)return fresh;
 const merged={...fresh,...input};
 merged.version=1;
 merged.scenes=(input.scenes?.length?input.scenes:fresh.scenes).map(s=>({...s,tracks:s.tracks||[]}));
 merged.assets=input.assets||[];
 merged.activeSceneId=merged.scenes.some(s=>s.id===input.activeSceneId)?input.activeSceneId!:merged.scenes[0].id;
 if(input.activeCharacterBinding&&typeof input.activeCharacterBinding.assetId==='string'&&typeof input.activeCharacterBinding.rigId==='string')merged.activeCharacterBinding=input.activeCharacterBinding;else delete merged.activeCharacterBinding;
 return merged;
}

function structuredCloneSafe<T>(value:T):T{try{return structuredClone(value)}catch{return JSON.parse(JSON.stringify(value))}}
function createFallback():StudioProject{
 const id=`scene-${Date.now()}`;
 return {version:1,name:'Untitled Project',activeSceneId:id,scenes:[{id,name:'Scene 01',width:1920,height:1080,fps:24,duration:240,tracks:[]}],assets:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}
