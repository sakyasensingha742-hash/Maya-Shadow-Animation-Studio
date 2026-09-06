import {Asset} from '../project/projectModel';
export const createAsset=(name:string,type:Asset['type'],source:string):Asset=>({id:`asset-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,name,type,source,createdAt:new Date().toISOString()});
export const assetTypeLabel=(type:Asset['type'])=>({image:'Image',audio:'Audio',video:'Video',character:'Character',background:'Background'}[type]);
