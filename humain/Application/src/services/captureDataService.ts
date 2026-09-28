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

export type PatrimonialObject={
  programme_id:string;
  capture_id?:string|null;
  structure_version:string;
  object_id:string;
  object_type:string;
  object_status?:string|null;
  label?:string|null;
  parent_object_id?:string|null;
  source_id?:string|null;
  confidence_score?:number|null;
};

export type Observation={
  programme_id:string;
  capture_id:string;
  structure_version?:string|null;
  source_id:string;
  observation_id:string;
  object_id:string;
  attribute_id:string;
  structural_binding_status?:string|null;
  value_raw?:unknown;
  value_normalized?:unknown;
  unit_raw?:string|null;
  unit_normalized?:string|null;
  page_or_plan?:string|null;
  source_anchor?:string|null;
  identification_mode?:string;
  confidence?:{score?:number};
};

export type Anomaly={
  programme_id:string;
  capture_id:string;
  source_id?:string|null;
  anomaly_id:string;
  anomaly_type:string;
  object_id?:string|null;
  source_reference?:string|null;
  description:string;
  confidence_score?:number|null;
  resolution_status?:string|null;
  resolved_by_structure_version?:string|null;
};

export type Source={
  programme_id:string;
  capture_id:string;
  source_id:string;
  filename:string;
  document_type?:string|null;
  document_date?:string|null;
  comment?:string|null;
};

export type Relation={
  programme_id:string;
  capture_id:string;
  source_id:string;
  relation_id:string;
  relation_type:string;
  source_object_id:string;
  target_object_id?:string|null;
  external_target?:string|null;
  structural_binding_status?:string|null;
  page_or_plan?:string|null;
  confidence_score?:number|null;
};

export type CurrentData={
  structure:{programme_id:string;structure_version:string;objects:PatrimonialObject[]};
  observations:{programme_id:string;observations:Observation[]};
  anomalies:{programme_id:string;anomalies:Anomaly[]};
  sources:{programme_id:string;sources:Source[]};
  relations:{programme_id:string;relations:Relation[]};
};

export type ValidationData={
  validation_id:string;
  programme_id:string;
  action:string;
  human_approval:boolean;
  ariane_version:string;
  source_capture_id?:string;
  source_structure_version?:string;
  target_structure_version:string;
  approved_candidate_object_ids?:string[];
  requested_changes?:string[];
  applied_changes?:Array<Record<string,unknown>>;
  not_applied_changes?:Array<Record<string,unknown>>;
  promoted_to_current?:Record<string,number>;
  resolved_current_anomaly_ids?:string[];
  historical_captures_modified?:boolean;
  autonomous_ai_validation?:boolean;
};

const base=config.captureDataBaseUrl.replace(/\/$/,'');
const fetchJson=async<T>(path:string):Promise<T>=>{
  const url=`${base}/${path.replace(/^\//,'')}?v=${Date.now()}`;
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`Impossible de charger ${path} (${response.status})`);
  return response.json() as Promise<T>;
};

export const captureDataService={
  loadJson:<T>(path:string)=>fetchJson<T>(path),
  loadCatalog:()=>fetchJson<CaptureCatalog>('catalog.json'),
  loadProgrammeIndex:(path:string)=>fetchJson<ProgrammeIndex>(path),
  async loadAllProgrammes():Promise<ProgrammeData[]>{
    const catalog=await this.loadCatalog();
    return Promise.all(catalog.programmes.map(async programme=>({
      catalog:programme,
      index:await this.loadProgrammeIndex(programme.index_path)
    })));
  },
  async loadCurrent(programme:ProgrammeData):Promise<CurrentData>{
    if(!programme.index.current?.available)throw new Error(`Aucun CURRENT disponible pour ${programme.index.programme_id}`);
    const root=programme.index.current.path;
    const [structure,observations,anomalies,sources,relations]=await Promise.all([
      fetchJson<CurrentData['structure']>(`${root}/structure.json`),
      fetchJson<CurrentData['observations']>(`${root}/observations.json`),
      fetchJson<CurrentData['anomalies']>(`${root}/anomalies.json`),
      fetchJson<CurrentData['sources']>(`${root}/sources.json`),
      fetchJson<CurrentData['relations']>(`${root}/relations.json`)
    ]);
    return {structure,observations,anomalies,sources,relations};
  },
  loadValidation:(programmeId:string,structureVersion:string)=>fetchJson<ValidationData>(
    `programmes/${programmeId}/validations/${structureVersion}.json`
  ),
  rawUrl:(path:string)=>`${base}/${path.replace(/^\//,'')}`
};
