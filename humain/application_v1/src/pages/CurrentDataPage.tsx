import {useEffect,useMemo,useState} from 'react';
import type {CSSProperties} from 'react';
import {AlertTriangle,ChevronDown,ChevronRight,Database,FileText,Funnel,Gauge,GitBranch,Link2,ListChecks,LoaderCircle,Search} from 'lucide-react';
import {captureDataService,type Anomaly,type AttributeReference,type CurrentData,type Observation,type PatrimonialObject,type ProgrammeData} from '../services/captureDataService';

type Tab='structure'|'observations'|'reference'|'anomalies'|'sources'|'relations';
type AttributeFilters={objectType:string;object:string;attribute:string;value:string;unit:string;source:string;confidence:string};
type SourceFilters={id:string;filename:string;type:string;date:string;comment:string};
type RelationFilters={id:string;type:string;source:string;target:string;evidence:string;confidence:string};

const emptyAttributeFilters=():AttributeFilters=>({objectType:'',object:'',attribute:'',value:'',unit:'',source:'',confidence:''});
const emptySourceFilters=():SourceFilters=>({id:'',filename:'',type:'',date:'',comment:''});
const emptyRelationFilters=():RelationFilters=>({id:'',type:'',source:'',target:'',evidence:'',confidence:''});

const valueText=(value:unknown)=>{
  if(value===null||value===undefined)return '—';
  if(typeof value==='object')return JSON.stringify(value);
  return String(value);
};

const matches=(value:unknown,filter:string)=>!filter.trim()||valueText(value).toLowerCase().includes(filter.trim().toLowerCase());
const exactMatches=(value:unknown,filter:string)=>!filter||valueText(value)===filter;
const isRepereSource=(observation:Observation)=>observation.attribute_id.trim().toLowerCase()==='repere_source';

const uniqueValues=(values:unknown[])=>Array.from(new Set(
  values.map(value=>value===null||value===undefined?'':String(value).trim()).filter(Boolean)
)).sort((a,b)=>a.localeCompare(b,'fr',{numeric:true}));

function FilterInput({value,onChange,label}:{value:string;onChange:(value:string)=>void;label:string}){
  return <input className="ariane-column-filter" value={value} onChange={e=>onChange(e.target.value)} placeholder="Filtrer…" aria-label={`Filtrer ${label}`}/>;
}

function FilterSelect({value,onChange,label,options}:{value:string;onChange:(value:string)=>void;label:string;options:string[]}){
  return <select className="ariane-column-filter ariane-column-select" value={value} onChange={e=>onChange(e.target.value)} aria-label={`Filtrer ${label}`}>
    <option value="">Tous</option>
    {options.map(option=><option key={option} value={option}>{option}</option>)}
  </select>;
}

const activeFilterCount=(filters:Record<string,string>)=>Object.values(filters).filter(value=>value.trim()).length;

function TableFilterMenu({visible,onToggle,count,onClear}:{visible:boolean;onToggle:()=>void;count:number;onClear:()=>void}){
  return <div className="ariane-table-tools">
    <button className="ariane-filter-toggle" type="button" onClick={onToggle} aria-expanded={visible}>
      <Funnel/>{count>0?`Filtres (${count})`:'Filtres'}{visible?<ChevronDown/>:<ChevronRight/>}
    </button>
    {count>0&&<button className="ariane-filter-clear" type="button" onClick={onClear}>Effacer les filtres</button>}
  </div>;
}

function StructureTree({objects,data,onOpenAttributes,onOpenAnomalies}:{objects:PatrimonialObject[];data:CurrentData;onOpenAttributes:(objectId:string)=>void;onOpenAnomalies:(objectId:string)=>void}){
  const byId=useMemo(()=>new Map(objects.map(o=>[o.object_id,o])),[objects]);
  const children=useMemo(()=>{
    const map=new Map<string,PatrimonialObject[]>();
    objects.forEach(o=>{
      if(!o.parent_object_id)return;
      const list=map.get(o.parent_object_id)||[];
      list.push(o);
      map.set(o.parent_object_id,list);
    });
    for(const list of map.values())list.sort((a,b)=>(a.label||a.object_id).localeCompare(b.label||b.object_id,'fr'));
    return map;
  },[objects]);
  const roots=useMemo(()=>objects.filter(o=>!o.parent_object_id||!byId.has(o.parent_object_id)),[objects,byId]);
  const observationsByObject=useMemo(()=>{
    const map=new Map<string,Observation[]>();
    data.observations.observations.forEach(observation=>{
      const list=map.get(observation.object_id)||[];
      list.push(observation);
      map.set(observation.object_id,list);
    });
    for(const list of map.values())list.sort((a,b)=>a.attribute_id.localeCompare(b.attribute_id,'fr'));
    return map;
  },[data]);
  const anomaliesByObject=useMemo(()=>{
    const map=new Map<string,Anomaly[]>();
    data.anomalies.anomalies.forEach(anomaly=>{
      if(!anomaly.object_id)return;
      if((anomaly.resolution_status||'').trim().toUpperCase()==='RESOLUE')return;
      const list=map.get(anomaly.object_id)||[];
      list.push(anomaly);
      map.set(anomaly.object_id,list);
    });
    return map;
  },[data]);
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set(children.keys()));
  const [attributesOpen,setAttributesOpen]=useState<Set<string>>(()=>new Set());
  const [anomaliesOpen,setAnomaliesOpen]=useState<Set<string>>(()=>new Set());
  const [showRepereSource,setShowRepereSource]=useState(false);
  const [bulkType,setBulkType]=useState('');

  const repereObjectCount=useMemo(()=>new Set(
    data.observations.observations.filter(isRepereSource).map(observation=>observation.object_id)
  ).size,[data]);

  const visibleObservationsByObject=useMemo(()=>{
    const map=new Map<string,Observation[]>();
    for(const [objectId,list] of observationsByObject){
      map.set(objectId,showRepereSource?list:list.filter(observation=>!isRepereSource(observation)));
    }
    return map;
  },[observationsByObject,showRepereSource]);

  const collapsibleTypes=useMemo(()=>{
    const counts=new Map<string,number>();
    objects.forEach(object=>{
      if((children.get(object.object_id)||[]).length===0)return;
      counts.set(object.object_type,(counts.get(object.object_type)||0)+1);
    });
    return Array.from(counts.entries()).sort((a,b)=>a[0].localeCompare(b[0],'fr'));
  },[objects,children]);

  useEffect(()=>{setExpanded(new Set(children.keys()));setAttributesOpen(new Set());setAnomaliesOpen(new Set());},[children]);
  useEffect(()=>{
    if(bulkType&&collapsibleTypes.some(([type])=>type===bulkType))return;
    setBulkType(collapsibleTypes[0]?.[0]||'');
  },[bulkType,collapsibleTypes]);

  const toggleExpanded=(objectId:string)=>setExpanded(current=>{
    const next=new Set(current);
    if(next.has(objectId))next.delete(objectId);else next.add(objectId);
    return next;
  });

  const toggleAttributes=(objectId:string)=>setAttributesOpen(current=>{
    const next=new Set(current);
    if(next.has(objectId))next.delete(objectId);else next.add(objectId);
    return next;
  });

  const toggleAnomalies=(objectId:string)=>setAnomaliesOpen(current=>{
    const next=new Set(current);
    if(next.has(objectId))next.delete(objectId);else next.add(objectId);
    return next;
  });

  const setTypeExpanded=(objectType:string,shouldExpand:boolean)=>setExpanded(current=>{
    const next=new Set(current);
    objects.forEach(object=>{
      if(object.object_type!==objectType||(children.get(object.object_id)||[]).length===0)return;
      if(shouldExpand)next.add(object.object_id);else next.delete(object.object_id);
    });
    return next;
  });

  const Node=({object,depth=0,seen=new Set<string>()}:{object:PatrimonialObject;depth?:number;seen?:Set<string>})=>{
    if(seen.has(object.object_id))return null;
    const next=new Set(seen);next.add(object.object_id);
    const kids=children.get(object.object_id)||[];
    const isExpanded=expanded.has(object.object_id);
    const visibleCapturedAttributes=visibleObservationsByObject.get(object.object_id)||[];
    const groupedAttributes=Array.from(visibleCapturedAttributes.reduce((groups,observation)=>{
      const value=observation.value_normalized??observation.value_raw;
      const unit=observation.unit_normalized||observation.unit_raw||'—';
      const key=`${observation.attribute_id}\u0000${valueText(value)}\u0000${unit}`;
      const current=groups.get(key);
      const sourceLabel=observation.page_or_plan?`${observation.source_id} (${observation.page_or_plan})`:observation.source_id;
      if(current){
        current.sources.add(sourceLabel);
      }else{
        groups.set(key,{attributeId:observation.attribute_id,value,unit,sources:new Set([sourceLabel])});
      }
      return groups;
    },new Map<string,{attributeId:string;value:unknown;unit:string;sources:Set<string>}>()).values());
    const objectAnomalies=anomaliesByObject.get(object.object_id)||[];
    const areAttributesOpen=attributesOpen.has(object.object_id);
    const areAnomaliesOpen=anomaliesOpen.has(object.object_id);

    return <div className="ariane-tree-node" style={{'--depth':depth} as CSSProperties}>
      <div className="ariane-tree-row">
        <button className="ariane-tree-toggle" type="button" onClick={()=>toggleExpanded(object.object_id)} disabled={kids.length===0} aria-label={isExpanded?'Replier cet objet':'Déployer cet objet'} aria-expanded={kids.length?isExpanded:undefined}>
          {kids.length?(isExpanded?<ChevronDown/>:<ChevronRight/>):<span className="ariane-tree-toggle-spacer"/>}
        </button>
        <span className="ariane-type-badge">{object.object_type}</span>
        <div className="ariane-tree-main"><b>{object.label||object.object_id}</b><code>{object.object_id}</code></div>
        <div className="ariane-tree-meta">
          <button className="ariane-tree-attribute-button" type="button" onClick={()=>toggleAttributes(object.object_id)} disabled={groupedAttributes.length===0} aria-expanded={groupedAttributes.length?areAttributesOpen:undefined}>
            {groupedAttributes.length} attr.
          </button>
          {objectAnomalies.length>0
            ?<button className="ariane-tree-anomaly-button" type="button" onClick={()=>toggleAnomalies(object.object_id)} aria-expanded={areAnomaliesOpen}>
              <AlertTriangle/>{objectAnomalies.length} anomalie(s)
            </button>
            :<span className="ariane-tree-anomaly-slot" aria-hidden="true"/>}
        </div>
      </div>
      {areAttributesOpen&&groupedAttributes.length>0&&<div className="ariane-tree-attributes">
        <div className="ariane-tree-attributes-header"><b>Attributs captés</b><button type="button" onClick={()=>onOpenAttributes(object.object_id)}>Afficher les observations</button></div>
        <div className="ariane-tree-attribute-list">
          {groupedAttributes.map((attribute,index)=><div key={`${attribute.attributeId}-${index}`} className="ariane-tree-attribute-item">
            <span>{attribute.attributeId}</span>
            <strong>{valueText(attribute.value)}</strong>
            <small>{attribute.unit} · sources {Array.from(attribute.sources).join(' · ')}</small>
          </div>)}
        </div>
      </div>}
      {areAnomaliesOpen&&objectAnomalies.length>0&&<div className="ariane-tree-anomalies">
        <div className="ariane-tree-attributes-header"><b>Anomalies rattachées</b><button type="button" onClick={()=>onOpenAnomalies(object.object_id)}>Afficher les anomalies</button></div>
        <div className="ariane-tree-anomaly-list">
          {objectAnomalies.map(anomaly=><article key={anomaly.anomaly_id}>
            <div><span className="ariane-badge-warn">{anomaly.anomaly_type}</span><code>{anomaly.anomaly_id}</code><span>{anomaly.resolution_status||'OUVERTE'}</span></div>
            <p>{anomaly.description}</p>
            <small>{anomaly.source_reference||anomaly.source_id||'Source non renseignée'}</small>
          </article>)}
        </div>
      </div>}
      {isExpanded&&kids.map(k=><Node key={k.object_id} object={k} depth={depth+1} seen={next}/>)}
    </div>;
  };

  return <>
    <div className="ariane-tree-toolbar">
      <div className="ariane-tree-toolbar-summary"><b>{objects.length}</b><span>objet(s)</span></div>
      <label className="ariane-tree-option">
        <input type="checkbox" checked={showRepereSource} onChange={e=>setShowRepereSource(e.target.checked)}/>
        <span>Afficher <code>repere_source</code> <small>({repereObjectCount} objets)</small></span>
        <strong className={showRepereSource?'is-visible':'is-hidden'}>{showRepereSource?'Affichés':'Masqués'}</strong>
      </label>
      <div className="ariane-tree-bulk">
        <select value={bulkType} onChange={e=>setBulkType(e.target.value)} aria-label="Type d’objet à déployer ou replier">
          {collapsibleTypes.map(([type,count])=><option key={type} value={type}>{type} · {count}</option>)}
        </select>
        <button type="button" disabled={!bulkType} onClick={()=>setTypeExpanded(bulkType,true)}>Déployer le type</button>
        <button type="button" disabled={!bulkType} onClick={()=>setTypeExpanded(bulkType,false)}>Replier le type</button>
      </div>
      <div className="ariane-tree-toolbar-actions"><button type="button" onClick={()=>setExpanded(new Set(children.keys()))}>Tout déployer</button><button type="button" onClick={()=>setExpanded(new Set())}>Tout replier</button></div>
    </div>
    <div className="ariane-tree" key={showRepereSource?'repere-visible':'repere-hidden'}>{roots.map(r=><Node key={r.object_id} object={r}/>)}</div>
  </>;
}

export function CurrentDataPage({programmeId:requestedProgrammeId}:{programmeId?:string}={}){
  const [programmes,setProgrammes]=useState<ProgrammeData[]>([]);
  const [programmeId,setProgrammeId]=useState(requestedProgrammeId||'');
  const [data,setData]=useState<CurrentData|null>(null);
  const [attributeReference,setAttributeReference]=useState<AttributeReference|null>(null);
  const [tab,setTab]=useState<Tab>('structure');
  const [query,setQuery]=useState('');
  const [attributeFilters,setAttributeFilters]=useState<AttributeFilters>(emptyAttributeFilters);
  const [sourceFilters,setSourceFilters]=useState<SourceFilters>(emptySourceFilters);
  const [relationFilters,setRelationFilters]=useState<RelationFilters>(emptyRelationFilters);
  const [attributeFiltersVisible,setAttributeFiltersVisible]=useState(false);
  const [sourceFiltersVisible,setSourceFiltersVisible]=useState(false);
  const [relationFiltersVisible,setRelationFiltersVisible]=useState(false);
  const [referenceStatus,setReferenceStatus]=useState<'all'|'captured'|'missing'>('all');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{let active=true;
    captureDataService.loadAttributeReference().then(reference=>{if(active)setAttributeReference(reference)}).catch(()=>{if(active)setAttributeReference(null)});
    return()=>{active=false};
  },[]);

  useEffect(()=>{let active=true;captureDataService.loadAllProgrammes().then(items=>{
    if(!active)return;
    setProgrammes(items);
    if(requestedProgrammeId){setProgrammeId(requestedProgrammeId);return;}
    const first=items.find(p=>p.index.current?.available);
    if(first)setProgrammeId(first.index.programme_id);
  }).catch(e=>setError(e instanceof Error?e.message:String(e))).finally(()=>setLoading(false));return()=>{active=false}},[requestedProgrammeId]);

  useEffect(()=>{if(!programmeId)return;const programme=programmes.find(p=>p.index.programme_id===programmeId);if(!programme)return;
    let active=true;setLoading(true);setError(null);
    captureDataService.loadCurrent(programme).then(v=>{if(active)setData(v)}).catch(e=>{if(active)setError(e instanceof Error?e.message:String(e))}).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[programmeId,programmes]);

  const q=query.trim().toLowerCase();

  const capturedAttributeIds=useMemo(()=>new Set(
    (data?.observations.observations||[]).map(observation=>observation.attribute_id.trim())
  ),[data]);

  const observationCountByAttribute=useMemo(()=>{
    const counts=new Map<string,number>();
    (data?.observations.observations||[]).forEach(observation=>{
      const attributeId=observation.attribute_id.trim();
      counts.set(attributeId,(counts.get(attributeId)||0)+1);
    });
    return counts;
  },[data]);

  const attributeCoverage=useMemo(()=>{
    const total=attributeReference?.declaredCount||0;
    if(!data||!attributeReference)return {uniqueCaptured:null as number|null,total,coverage:null as number|null};
    const canonical=new Set(attributeReference.attributeIds);
    const captured=new Set(Array.from(capturedAttributeIds).filter(attributeId=>canonical.has(attributeId)));
    return {
      uniqueCaptured:captured.size,
      total,
      coverage:total>0?(captured.size/total)*100:null
    };
  },[data,attributeReference,capturedAttributeIds]);

  const referenceFamilies=useMemo(()=>{
    const attributes=attributeReference?.attributes||[];
    const named=uniqueValues(attributes.map(attribute=>attribute.family));
    if(named.length===0)return [];
    return attributes.some(attribute=>!attribute.family)?[...named,'Sans famille']:named;
  },[attributeReference]);

  const referenceRows=useMemo(()=>{
    if(!attributeReference)return [];
    return attributeReference.attributes.filter(attribute=>{
      const captured=capturedAttributeIds.has(attribute.attributeId);
      if(referenceStatus==='captured'&&!captured)return false;
      if(referenceStatus==='missing'&&captured)return false;
      if(!q)return true;
      return [
        attribute.attributeId,
        attribute.label,
        attribute.family,
        attribute.objects.join(' '),
        attribute.dataType,
        attribute.unit,
        captured?'capté':'non capté'
      ].some(value=>String(value||'').toLowerCase().includes(q));
    });
  },[attributeReference,capturedAttributeIds,referenceStatus,q]);

  const objectById=useMemo(()=>new Map((data?.structure.objects||[]).map(object=>[object.object_id,object])),[data]);
  const objects=useMemo(()=>!data?[]:data.structure.objects.filter(o=>!q||[o.object_id,o.object_type,o.label].some(v=>String(v||'').toLowerCase().includes(q))),[data,q]);

  const attributeFilterOptions=useMemo(()=>({
    objectTypes:uniqueValues((data?.structure.objects||[]).map(o=>o.object_type)),
    attributes:uniqueValues((data?.observations.observations||[]).map(o=>o.attribute_id)),
    units:uniqueValues((data?.observations.observations||[]).map(o=>o.unit_normalized||o.unit_raw)),
    sources:uniqueValues((data?.observations.observations||[]).map(o=>o.source_id)),
    confidences:uniqueValues((data?.observations.observations||[]).map(o=>o.confidence?.score))
  }),[data]);

  const sourceFilterOptions=useMemo(()=>({
    types:uniqueValues((data?.sources.sources||[]).map(s=>s.document_type)),
    dates:uniqueValues((data?.sources.sources||[]).map(s=>s.document_date))
  }),[data]);

  const relationFilterOptions=useMemo(()=>({
    types:uniqueValues((data?.relations.relations||[]).map(r=>r.relation_type)),
    confidences:uniqueValues((data?.relations.relations||[]).map(r=>r.confidence_score))
  }),[data]);

  const observations=useMemo(()=>!data?[]:data.observations.observations.filter(o=>{
    const objectType=objectById.get(o.object_id)?.object_type||'';
    return (!q||[objectType,o.object_id,o.attribute_id,o.value_raw,o.value_normalized,o.source_id].some(v=>valueText(v).toLowerCase().includes(q)))
      &&exactMatches(objectType,attributeFilters.objectType)
      &&matches(o.object_id,attributeFilters.object)
      &&exactMatches(o.attribute_id,attributeFilters.attribute)
      &&matches(o.value_normalized??o.value_raw,attributeFilters.value)
      &&exactMatches(o.unit_normalized||o.unit_raw||'',attributeFilters.unit)
      &&exactMatches(o.source_id,attributeFilters.source)
      &&exactMatches(o.confidence?.score??'',attributeFilters.confidence);
  }),[data,q,attributeFilters,objectById]);

  const anomalies=useMemo(()=>!data?[]:data.anomalies.anomalies.filter(a=>!q||[a.anomaly_id,a.anomaly_type,a.object_id,a.description].some(v=>String(v||'').toLowerCase().includes(q))),[data,q]);

  const sources=useMemo(()=>!data?[]:data.sources.sources.filter(s=>(!q||[s.source_id,s.filename,s.document_type,s.comment].some(v=>String(v||'').toLowerCase().includes(q)))
    &&matches(s.source_id,sourceFilters.id)
    &&matches(s.filename,sourceFilters.filename)
    &&exactMatches(s.document_type||'',sourceFilters.type)
    &&exactMatches(s.document_date||'',sourceFilters.date)
    &&matches(s.comment,sourceFilters.comment)),[data,q,sourceFilters]);

  const relations=useMemo(()=>!data?[]:data.relations.relations.filter(r=>(!q||[r.relation_id,r.relation_type,r.source_object_id,r.target_object_id].some(v=>String(v||'').toLowerCase().includes(q)))
    &&matches(r.relation_id,relationFilters.id)
    &&exactMatches(r.relation_type,relationFilters.type)
    &&matches(r.source_object_id,relationFilters.source)
    &&matches(r.target_object_id||r.external_target,relationFilters.target)
    &&matches(r.page_or_plan,relationFilters.evidence)
    &&exactMatches(r.confidence_score??'',relationFilters.confidence)),[data,q,relationFilters]);

  const openObjectAttributes=(objectId:string)=>{
    setTab('observations');
    setQuery('');
    setAttributeFilters({...emptyAttributeFilters(),object:objectId});
    setAttributeFiltersVisible(true);
  };

  const openObjectAnomalies=(objectId:string)=>{
    setTab('anomalies');
    setQuery(objectId);
  };

  if(loading&&!data)return <section className="ariane-data panel ariane-empty"><LoaderCircle className="ariane-spin"/><h1>Structures & données courantes</h1><p>Chargement de CURRENT…</p></section>;
  if(error&&!data)return <section className="ariane-data panel ariane-empty"><h1>Structures & données courantes</h1><p className="ariane-error">{error}</p></section>;
  if(!data)return <section className="ariane-data panel ariane-empty"><h1>Structures & données courantes</h1><p>Aucun CURRENT disponible.</p></section>;

  return <div className="ariane-data">
    <section className="panel ariane-data-header ariane-current-header">
      <div><p className="eyebrow">CURRENT · DONNÉES CONSOLIDÉES</p><h1>{data.structure.structure_version}</h1><p>{programmeId}</p></div>
      <div className="ariane-header-actions">
        {!requestedProgrammeId&&programmes.length>1&&<select value={programmeId} onChange={e=>setProgrammeId(e.target.value)}>{programmes.filter(p=>p.index.current?.available).map(p=><option key={p.index.programme_id}>{p.index.programme_id}</option>)}</select>}
        <button className="button" onClick={()=>location.reload()}>Actualiser</button>
      </div>
    </section>

    <section className="ariane-current-navigation">
      <button type="button" className={`ariane-nav-kpi ${tab==='structure'?'is-active':''}`} onClick={()=>{setTab('structure');setQuery('')}}>
        <GitBranch/><span><strong>Structure</strong><b>{data.structure.objects.length}</b><small>objets</small></span>
      </button>

      <article className="ariane-attribute-nav">
        <header><Database/><strong>Attributs</strong></header>
        <div>
          <button type="button" className={tab==='observations'?'is-active':''} onClick={()=>{setTab('observations');setQuery('')}}>
            <Database/><span><b>{data.observations.observations.length}</b><small>observations</small></span>
          </button>
          <button type="button" className={tab==='reference'?'is-active':''} onClick={()=>{setTab('reference');setReferenceStatus('all');setQuery('')}}>
            <ListChecks/><span><b>{attributeCoverage.uniqueCaptured??'—'}</b><small>attributs uniques captés</small></span>
          </button>
          <button type="button" className={tab==='reference'?'is-active':''} onClick={()=>{setTab('reference');setReferenceStatus('all');setQuery('')}}>
            <Gauge/><span><b>{attributeCoverage.coverage===null?'—':`${attributeCoverage.coverage.toFixed(1)} %`}</b><small>couverture du référentiel</small></span>
          </button>
        </div>
      </article>

      <button type="button" className={`ariane-nav-kpi ${tab==='anomalies'?'is-active':''}`} onClick={()=>{setTab('anomalies');setQuery('')}}>
        <AlertTriangle/><span><strong>Anomalies</strong><b>{data.anomalies.anomalies.length}</b><small>anomalies</small></span>
      </button>
      <button type="button" className={`ariane-nav-kpi ${tab==='sources'?'is-active':''}`} onClick={()=>{setTab('sources');setQuery('')}}>
        <FileText/><span><strong>Sources</strong><b>{data.sources.sources.length}</b><small>sources</small></span>
      </button>
      <button type="button" className={`ariane-nav-kpi ${tab==='relations'?'is-active':''}`} onClick={()=>{setTab('relations');setQuery('')}}>
        <Link2/><span><strong>Relations</strong><b>{data.relations.relations.length}</b><small>relations</small></span>
      </button>
    </section>

    <section className="panel ariane-explorer">
      <div className="ariane-view-heading">
        <div>
          <p className="eyebrow">DONNÉES COURANTES</p>
          <h2>{tab==='structure'?'Structure':tab==='observations'?'Observations captées':tab==='reference'?'Référentiel des attributs':tab==='anomalies'?'Anomalies':tab==='sources'?'Sources':'Relations'}</h2>
          {tab==='reference'&&<p>{attributeCoverage.uniqueCaptured??0} attribut(s) capté(s) sur {attributeCoverage.total||0} · couverture {attributeCoverage.coverage===null?'—':`${attributeCoverage.coverage.toFixed(1)} %`}</p>}
        </div>
        {tab==='reference'&&<div className="ariane-reference-status-filter">
          <label>Statut
            <select value={referenceStatus} onChange={e=>setReferenceStatus(e.target.value as 'all'|'captured'|'missing')}>
              <option value="all">Tous les attributs</option>
              <option value="captured">Captés</option>
              <option value="missing">Non captés</option>
            </select>
          </label>
        </div>}
      </div>

      <label className="ariane-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='reference'?'Rechercher dans le référentiel…':'Rechercher dans la vue…'}/></label>

      {tab==='structure'&&<StructureTree objects={q?objects:data.structure.objects} data={data} onOpenAttributes={openObjectAttributes} onOpenAnomalies={openObjectAnomalies}/>}

      {tab==='reference'&&<div className="ariane-reference-view">
        {!attributeReference?<section className="ariane-empty"><LoaderCircle className="ariane-spin"/><p>Chargement du référentiel attributaire…</p></section>:
        referenceFamilies.length>0
          ?<div className="ariane-reference-groups">{referenceFamilies.map(family=>{
            const rows=referenceRows.filter(attribute=>family==='Sans famille'?!attribute.family:attribute.family===family);
            if(rows.length===0)return null;
            return <section key={family} className="ariane-reference-family"><header><h3>{family}</h3><span>{rows.length} attribut(s)</span></header><div className="ariane-table-wrap"><table className="ariane-table ariane-reference-table"><thead><tr><th>Attribut</th><th>Libellé</th><th>Objets</th><th>Type</th><th>Unité</th><th>Statut</th><th>Observations</th></tr></thead><tbody>{rows.map(attribute=>{
              const captured=capturedAttributeIds.has(attribute.attributeId);
              return <tr key={attribute.attributeId}><td><code>{attribute.attributeId}</code></td><td>{attribute.label}</td><td>{attribute.objects.join(', ')||'—'}</td><td>{attribute.dataType||'—'}</td><td>{attribute.unit||'—'}</td><td><span className={captured?'ariane-reference-captured':'ariane-reference-missing'}>{captured?'Capté':'Non capté'}</span></td><td>{observationCountByAttribute.get(attribute.attributeId)||0}</td></tr>;
            })}</tbody></table></div></section>;
          })}</div>
          :<div className="ariane-table-wrap"><table className="ariane-table ariane-reference-table"><thead><tr><th>Attribut</th><th>Libellé</th><th>Objets</th><th>Type</th><th>Unité</th><th>Statut</th><th>Observations</th></tr></thead><tbody>{referenceRows.map(attribute=>{
            const captured=capturedAttributeIds.has(attribute.attributeId);
            return <tr key={attribute.attributeId}><td><code>{attribute.attributeId}</code></td><td>{attribute.label}</td><td>{attribute.objects.join(', ')||'—'}</td><td>{attribute.dataType||'—'}</td><td>{attribute.unit||'—'}</td><td><span className={captured?'ariane-reference-captured':'ariane-reference-missing'}>{captured?'Capté':'Non capté'}</span></td><td>{observationCountByAttribute.get(attribute.attributeId)||0}</td></tr>;
          })}</tbody></table></div>}
      </div>}

      {tab==='observations'&&<div className="ariane-table-section">
        <TableFilterMenu visible={attributeFiltersVisible} onToggle={()=>setAttributeFiltersVisible(v=>!v)} count={activeFilterCount(attributeFilters)} onClear={()=>setAttributeFilters(emptyAttributeFilters())}/>
        <div className="ariane-table-wrap"><table className="ariane-table"><thead>
          <tr><th>Type d’objet</th><th>Objet</th><th>Attribut</th><th>Valeur</th><th>Unité</th><th>Source</th><th>Confiance</th></tr>
          {attributeFiltersVisible&&<tr className="ariane-filter-row">
            <th><FilterSelect label="Type d’objet" value={attributeFilters.objectType} options={attributeFilterOptions.objectTypes} onChange={value=>setAttributeFilters(f=>({...f,objectType:value}))}/></th>
            <th><FilterInput label="Objet" value={attributeFilters.object} onChange={value=>setAttributeFilters(f=>({...f,object:value}))}/></th>
            <th><FilterSelect label="Attribut" value={attributeFilters.attribute} options={attributeFilterOptions.attributes} onChange={value=>setAttributeFilters(f=>({...f,attribute:value}))}/></th>
            <th><FilterInput label="Valeur" value={attributeFilters.value} onChange={value=>setAttributeFilters(f=>({...f,value}))}/></th>
            <th><FilterSelect label="Unité" value={attributeFilters.unit} options={attributeFilterOptions.units} onChange={value=>setAttributeFilters(f=>({...f,unit:value}))}/></th>
            <th><FilterSelect label="Source" value={attributeFilters.source} options={attributeFilterOptions.sources} onChange={value=>setAttributeFilters(f=>({...f,source:value}))}/></th>
            <th><FilterSelect label="Confiance" value={attributeFilters.confidence} options={attributeFilterOptions.confidences} onChange={value=>setAttributeFilters(f=>({...f,confidence:value}))}/></th>
          </tr>}
        </thead><tbody>{observations.map(o=><tr key={o.observation_id}>
          <td><span className="ariane-type-badge">{objectById.get(o.object_id)?.object_type||'—'}</span></td>
          <td><code>{o.object_id}</code></td>
          <td>{o.attribute_id}</td>
          <td>{valueText(o.value_normalized??o.value_raw)}</td>
          <td>{o.unit_normalized||o.unit_raw||'—'}</td>
          <td><code>{o.source_id}</code><small>{o.page_or_plan||''}</small></td>
          <td>{o.confidence?.score??'—'}</td>
        </tr>)}</tbody></table></div>
      </div>}

      {tab==='anomalies'&&<div className="ariane-anomaly-list">{anomalies.map(a=><article key={a.anomaly_id} className="ariane-anomaly"><div><span className="ariane-type-badge">{a.anomaly_type}</span><b>{a.anomaly_id}</b><span className={a.resolution_status==='RESOLUE'?'ariane-badge-ok':'ariane-badge-warn'}>{a.resolution_status||'OUVERTE'}</span></div><p>{a.description}</p><small>{a.object_id&&<>Objet <code>{a.object_id}</code> · </>}{a.source_reference||a.source_id||''}</small></article>)}</div>}

      {tab==='sources'&&<div className="ariane-table-section">
        <TableFilterMenu visible={sourceFiltersVisible} onToggle={()=>setSourceFiltersVisible(v=>!v)} count={activeFilterCount(sourceFilters)} onClear={()=>setSourceFilters(emptySourceFilters())}/>
        <div className="ariane-table-wrap"><table className="ariane-table"><thead>
          <tr><th>ID</th><th>Fichier</th><th>Type</th><th>Date</th><th>Commentaire</th></tr>
          {sourceFiltersVisible&&<tr className="ariane-filter-row">
            <th><FilterInput label="ID" value={sourceFilters.id} onChange={value=>setSourceFilters(f=>({...f,id:value}))}/></th>
            <th><FilterInput label="Fichier" value={sourceFilters.filename} onChange={value=>setSourceFilters(f=>({...f,filename:value}))}/></th>
            <th><FilterSelect label="Type" value={sourceFilters.type} options={sourceFilterOptions.types} onChange={value=>setSourceFilters(f=>({...f,type:value}))}/></th>
            <th><FilterSelect label="Date" value={sourceFilters.date} options={sourceFilterOptions.dates} onChange={value=>setSourceFilters(f=>({...f,date:value}))}/></th>
            <th><FilterInput label="Commentaire" value={sourceFilters.comment} onChange={value=>setSourceFilters(f=>({...f,comment:value}))}/></th>
          </tr>}
        </thead><tbody>{sources.map(s=><tr key={s.source_id}><td><code>{s.source_id}</code></td><td>{s.filename}</td><td>{s.document_type||'—'}</td><td>{s.document_date||'—'}</td><td>{s.comment||'—'}</td></tr>)}</tbody></table></div>
      </div>}

      {tab==='relations'&&<div className="ariane-table-section">
        <TableFilterMenu visible={relationFiltersVisible} onToggle={()=>setRelationFiltersVisible(v=>!v)} count={activeFilterCount(relationFilters)} onClear={()=>setRelationFilters(emptyRelationFilters())}/>
        <div className="ariane-table-wrap"><table className="ariane-table"><thead>
          <tr><th>ID</th><th>Type</th><th>Source</th><th>Cible</th><th>Preuve</th><th>Confiance</th></tr>
          {relationFiltersVisible&&<tr className="ariane-filter-row">
            <th><FilterInput label="ID" value={relationFilters.id} onChange={value=>setRelationFilters(f=>({...f,id:value}))}/></th>
            <th><FilterSelect label="Type" value={relationFilters.type} options={relationFilterOptions.types} onChange={value=>setRelationFilters(f=>({...f,type:value}))}/></th>
            <th><FilterInput label="Source" value={relationFilters.source} onChange={value=>setRelationFilters(f=>({...f,source:value}))}/></th>
            <th><FilterInput label="Cible" value={relationFilters.target} onChange={value=>setRelationFilters(f=>({...f,target:value}))}/></th>
            <th><FilterInput label="Preuve" value={relationFilters.evidence} onChange={value=>setRelationFilters(f=>({...f,evidence:value}))}/></th>
            <th><FilterSelect label="Confiance" value={relationFilters.confidence} options={relationFilterOptions.confidences} onChange={value=>setRelationFilters(f=>({...f,confidence:value}))}/></th>
          </tr>}
        </thead><tbody>{relations.map(r=><tr key={r.relation_id}><td><code>{r.relation_id}</code></td><td>{r.relation_type}</td><td><code>{r.source_object_id}</code></td><td><code>{r.target_object_id||r.external_target||'—'}</code></td><td>{r.page_or_plan||'—'}</td><td>{r.confidence_score??'—'}</td></tr>)}</tbody></table></div>
      </div>}
    </section>
  </div>;
}
