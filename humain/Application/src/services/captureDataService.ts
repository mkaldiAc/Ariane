import {config} from '../config';

export type CatalogProgram={programme_id:string;index_path:string};
export type CaptureCatalog={schema_version:string;ariane_version:string;programmes:CatalogProgram[]};
export type CaptureEntry={capture_id:string;sequence:number;mode:string;path:string;structure_version:string|null};
export type StructureEntry={structure_version:string;path:string};
export type CurrentEntry={available:boolean;structure_version:string|null;path:string};
export type ProgrammeIndex={
  programme_id:string;
  captures:CaptureEntry[];
  structures:StructureEntry[];
  current:CurrentEntry;
};
export type ProgrammeData={catalog:CatalogProgram;index:ProgrammeIndex};

const base=config.captureDataBaseUrl.replace(/\/$/,'');
const fetchJson=async<T>(path:string):Promise<T>=>{
  const url=`${base}/${path.replace(/^\//,'')}?v=${Date.now()}`;
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`Impossible de charger ${path} (${response.status})`);
  return response.json() as Promise<T>;
};

export const captureDataService={
  loadCatalog:()=>fetchJson<CaptureCatalog>('catalog.json'),
  loadProgrammeIndex:(path:string)=>fetchJson<ProgrammeIndex>(path),
  async loadAllProgrammes():Promise<ProgrammeData[]>{
    const catalog=await this.loadCatalog();
    return Promise.all(catalog.programmes.map(async programme=>({
      catalog:programme,
      index:await this.loadProgrammeIndex(programme.index_path)
    })));
  },
  rawUrl:(path:string)=>`${base}/${path.replace(/^\//,'')}`
};
