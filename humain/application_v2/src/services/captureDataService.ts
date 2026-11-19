import {config} from '../config';
import attributeSnapshot from '../referentiel/attributs-patrimoniaux.json';

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

export type CaptureMetadata={
  programme_id:string;
  capture_id:string;
  sequence:number;
  mode:string;
  ariane_version:string;
  structure_version:string|null;
  immutable:boolean;
  capture_date?:string|null;
  captured_at?:string|null;
  created_at?:string|null;
  date?:string|null;
  status?:string|null;
  files:{
    sources?:string|null;
    structure_proposee?:string|null;
    objets_candidats?:string|null;
    observations?:string|null;
    relations?:string|null;
    anomalies?:string|null;
    propositions_structure?:string|null;
  };
};

export type CaptureDetail={
  entry:CaptureEntry;
  metadata:CaptureMetadata;
  sources:Source[];
  candidates:PatrimonialObject[];
  proposals:StructureProposal[];
};

export type StructureData={programme_id:string;structure_version:string;objects:PatrimonialObject[]};

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
  candidate_handling?:Array<Record<string,unknown>>;
  promoted_to_current?:Record<string,number|string>;
  resolved_current_anomaly_ids?:string[];
  current_anomalies_updated?:unknown[];
  historical_captures_modified?:boolean;
  autonomous_ai_validation?:boolean;
};

export type ProgrammeCurrentMetrics={
  objects:number;
  observations:number;
  structureVersion:string|null;
};

export type StructureDetail={
  entry:StructureEntry;
  structure:StructureData;
  validation:ValidationData|null;
};

export type StructureProposal={
  proposal_id:string;
  programme_id:string;
  capture_id:string;
  operation:'AJOUT'|'RETRAIT'|'MODIFIER_PARENT'|'REINTEGRATION';
  qualification_status:'IDENTIFIEE'|'A_QUALIFIER';
  object_id?:string|null;
  object_type?:string|null;
  from_parent_object_id?:string|null;
  to_parent_object_id?:string|null;
  source_id:string;
  source_anchor?:string|null;
  anomaly_id?:string|null;
  description:string;
  evidence?:string|null;
  legacy?:boolean;
};
export type HistoricalObject={object:PatrimonialObject;structureVersions:string[]};

export type StructureCandidate={
  object:PatrimonialObject;
  captureIds:string[];
  firstSequence:number;
  latestSequence:number;
  latestCaptureId:string;
};

export type AttributeReferenceItem={
  attributeId:string;
  label:string;
  objects:string[];
  dataType:string|null;
  unit:string|null;
  family:string|null;
  catalogGroup:string|null;
};

export type AttributeReference={
  version:string|null;
  declaredCount:number;
  attributeIds:string[];
  attributes:AttributeReferenceItem[];
};

const base=config.captureDataBaseUrl.replace(/\/$/,'');
const fetchJson=async<T>(path:string):Promise<T>=>{
  const url=`${base}/${(path.startsWith('/')?path.slice(1):path)}?v=${Date.now()}`;
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`Impossible de charger ${path} (${response.status})`);
  return response.json() as Promise<T>;
};

export const captureDataService={
  loadJson:<T>(path:string)=>fetchJson<T>(path),
  loadCatalog:()=>fetchJson<CaptureCatalog>('catalog.json'),
  loadProgrammeIndex:(path:string)=>fetchJson<ProgrammeIndex>(path),
  async loadAttributeReference():Promise<AttributeReference>{
    // Catalogue embarqué, dérivé du référentiel normatif ia/ sur main lors de la maintenance.
    const attributes:AttributeReferenceItem[]=attributeSnapshot.attributes;
    return {
      version:attributeSnapshot.source_version,
      declaredCount:attributeSnapshot.declaredCount,
      attributeIds:attributes.map(attribute=>attribute.attributeId),
      attributes
    };
  },
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
  async loadCurrentMetrics(programme:ProgrammeData):Promise<ProgrammeCurrentMetrics>{
    if(!programme.index.current?.available)return {objects:0,observations:0,structureVersion:null};
    const root=programme.index.current.path;
    const [structure,observations]=await Promise.all([
      fetchJson<CurrentData['structure']>(`${root}/structure.json`),
      fetchJson<CurrentData['observations']>(`${root}/observations.json`)
    ]);
    return {
      objects:structure.objects.length,
      observations:observations.observations.length,
      structureVersion:structure.structure_version
    };
  },
  async loadCaptureDetail(entry:CaptureEntry):Promise<CaptureDetail>{
    const metadata=await fetchJson<CaptureMetadata>(`${entry.path}/capture.json`);
    const sources=metadata.files.sources
      ?(await fetchJson<{sources:Source[]}>(`${entry.path}/${metadata.files.sources}`)).sources
      :[];
    const candidates=metadata.files.objets_candidats
      ?(await fetchJson<{objects:PatrimonialObject[]}>(`${entry.path}/${metadata.files.objets_candidats}`)).objects
      :[];
    const proposals=metadata.files.propositions_structure
      ?(await fetchJson<{proposals:StructureProposal[]}>(`${entry.path}/${metadata.files.propositions_structure}`)).proposals
      :[];
    return {entry,metadata,sources,candidates,proposals};
  },
  async loadStructureDetail(programmeId:string,entry:StructureEntry):Promise<StructureDetail>{
    const structure=await fetchJson<StructureData>(`${entry.path}/structure.json`);
    let validation:ValidationData|null=null;
    try{
      validation=await this.loadValidation(programmeId,entry.structure_version);
    }catch{
      validation=null;
    }
    return {entry,structure,validation};
  },
  async loadCandidatesForStructure(programme:ProgrammeData,structure:StructureData):Promise<StructureCandidate[]>{
    const targetIndex=programme.index.structures.findIndex(entry=>entry.structure_version===structure.structure_version);
    if(targetIndex<0)return [];

    const versionRank=(version:string|null|undefined)=>{
      if(!version||version==='PROPOSEE')return 0;
      const index=programme.index.structures.findIndex(entry=>entry.structure_version===version);
      return index<0?Number.POSITIVE_INFINITY:index+1;
    };

    const targetRank=targetIndex+1;
    const existingObjectIds=new Set(structure.objects.map(object=>object.object_id));
    const captures=await Promise.all(programme.index.captures.map(entry=>this.loadCaptureDetail(entry)));
    const eligibleCaptures=captures
      .filter(capture=>versionRank(capture.metadata.structure_version||capture.entry.structure_version)<=targetRank)
      .sort((a,b)=>a.entry.sequence-b.entry.sequence);

    const byObjectId=new Map<string,StructureCandidate>();
    eligibleCaptures.forEach(capture=>{
      capture.candidates.forEach(object=>{
        if(existingObjectIds.has(object.object_id))return;
        const current=byObjectId.get(object.object_id);
        if(current){
          if(!current.captureIds.includes(capture.entry.capture_id))current.captureIds.push(capture.entry.capture_id);
          if(capture.entry.sequence>=current.latestSequence){
            current.object=object;
            current.latestSequence=capture.entry.sequence;
            current.latestCaptureId=capture.entry.capture_id;
          }
          return;
        }
        byObjectId.set(object.object_id,{
          object,
          captureIds:[capture.entry.capture_id],
          firstSequence:capture.entry.sequence,
          latestSequence:capture.entry.sequence,
          latestCaptureId:capture.entry.capture_id
        });
      });
    });

    return Array.from(byObjectId.values()).sort((a,b)=>
      a.firstSequence-b.firstSequence||a.object.object_id.localeCompare(b.object.object_id,'fr',{numeric:true})
    );
  },
  async loadHistoricalObjects(programme:ProgrammeData,current:StructureData):Promise<HistoricalObject[]>{
    const structures=await Promise.all(programme.index.structures.map(entry=>
      fetchJson<StructureData>(`${entry.path}/structure.json`)
    ));
    const active=new Set(current.objects.map(object=>object.object_id));
    const grouped=new Map<string,HistoricalObject>();
    structures.forEach(structure=>structure.objects.forEach(object=>{
      if(active.has(object.object_id))return;
      const existing=grouped.get(object.object_id);
      if(existing){
        existing.object=object;
        if(!existing.structureVersions.includes(structure.structure_version))
          existing.structureVersions.push(structure.structure_version);
      }else grouped.set(object.object_id,{object,structureVersions:[structure.structure_version]});
    }));
    return [...grouped.values()].sort((a,b)=>a.object.object_id.localeCompare(b.object.object_id,'fr',{numeric:true}));
  },
  async loadStructureProposals(programme:ProgrammeData):Promise<StructureProposal[]>{
    const captures=await Promise.all(programme.index.captures.map(entry=>this.loadCaptureDetail(entry)));
    const proposals:StructureProposal[]=[];
    await Promise.all(captures.map(async capture=>{
      proposals.push(...capture.proposals);
      // Compatibilité de lecture : les anciennes anomalies restent des écarts à qualifier,
      // jamais des objets arbitrairement sélectionnés pour retrait.
      if(capture.proposals.length||!capture.metadata.files.anomalies)return;
      const data=await fetchJson<{anomalies:Anomaly[]}>(`${capture.entry.path}/${capture.metadata.files.anomalies}`);
      for(const anomaly of data.anomalies){
        if(anomaly.anomaly_type!=='INCOHERENCE_STRUCTURE')continue;
        const description=anomaly.description;
        // L'adaptateur des CAPTURE antérieures ne choisit JAMAIS d'object_id.
        // Une incohérence numérique favorable à l'ajout ne doit pas être
        // étiquetée comme un retrait (cf. grilles de loyer de BRECE).
        const reportedMatch=description.match(/\b(\d+)\s+(?:places?|locaux?|v[ée]hicules?|PST|LPO)\b/i);
        const expectedMatch=description.match(/\bSTR-\d+[^.;]{0,100}?(?:contient|comporte)\s+(\d+)\s+(?:objets?\s+)?(?:PST|LPO|places?)\b/i);
        const singularWaste=/\b(?:un seul|une seule)\s+local\b/i.test(description)
          &&/\bSTR-\d+\s+(?:deux|2)\s+LPO\b/i.test(description);
        const documented=singularWaste?1:reportedMatch?Number(reportedMatch[1]):null;
        const validated=singularWaste?2:expectedMatch?Number(expectedMatch[1]):null;
        if(documented===null||validated===null||documented===validated)continue;
        const operation:StructureProposal['operation']=documented<validated?'RETRAIT':'AJOUT';
        proposals.push({
          proposal_id:`LEGACY_${capture.entry.capture_id}_${anomaly.anomaly_id}`,
          programme_id:programme.index.programme_id,capture_id:capture.entry.capture_id,
          operation,qualification_status:'A_QUALIFIER',object_id:null,
          source_id:anomaly.source_id||'SOURCE_HISTORIQUE_NON_PRECISEE',
          source_anchor:anomaly.source_reference||null,anomaly_id:anomaly.anomaly_id,
          description,legacy:true
        });
      }
    }));
    return proposals.sort((a,b)=>a.capture_id.localeCompare(b.capture_id,'fr')||a.proposal_id.localeCompare(b.proposal_id,'fr'));
  },
  loadValidation:(programmeId:string,structureVersion:string)=>fetchJson<ValidationData>(
    `programmes/${programmeId}/validations/${structureVersion}.json`
  ),
  rawUrl:(path:string)=>`${base}/${path.replace(/^\//,'')}`
};
