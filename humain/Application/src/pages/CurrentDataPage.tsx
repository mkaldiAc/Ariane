import {useEffect,useMemo,useState} from 'react';
import type {CSSProperties} from 'react';
import {AlertTriangle,ChevronDown,ChevronRight,Database,FileText,GitBranch,Link2,LoaderCircle,Search} from 'lucide-react';
import {captureDataService,type CurrentData,type Observation,type PatrimonialObject,type ProgrammeData} from '../services/captureDataService';

type Tab='structure'|'observations'|'anomalies'|'sources'|'relations';
type AttributeFilters={object:string;attribute:string;value:string;unit:string;source:string;confidence:string};
type SourceFilters={id:string;filename:string;type:string;date:string;comment:string};
type RelationFilters={id:string;type:string;source:string;target:string;evidence:string;confidence:string};

const valueText=(value:unknown)=>{
  if(value===null||value===undefined)return '—';
  if(typeof value==='object')return JSON.stringify(value);
  return String(value);
};

const matches=(value:unknown,filter:string)=>!filter.trim()||valueText(value).toLowerCase().includes(filter.trim().toLowerCase());

function FilterInput({value,onChange,label}:{value:string;onChange:(value:string)=>void;label:string}){
  return <input className="ariane-column-filter" value={value} onChange={e=>onChange(e.target.value)} placeholder="Filtrer…" aria-label={`Filtrer ${label}`}/>;
}

function StructureTree({objects,data,onOpenAttributes}:{objects:PatrimonialObject[];data:CurrentData;onOpenAttributes:(objectId:string)=>void}){
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
    const m=new Map<string,Observation[]>();
    data.observations.observations.forEach(o=>{
      const list=m.get(o.object_id)||[];
      list.push(o);
      m.set(o.object_id,list);
    });
    for(const list of m.values())list.sort((a,b)=>a.attribute_id.localeCompare(b.attribute_id,'fr'));
    return m;
  },[data]);
  const anoCount=useMemo(()=>{
    const m=new Map<string,number>();
    data.anomalies.anomalies.forEach(a=>{if(a.object_id)m.set(a.object_id,(m.get(a.object_id)||0)+1)});
    return m;
  },[data]);
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set(children.keys()));
  const [attributesOpen,setAttributesOpen]=useState<Set<string>>(()=>new Set());

  useEffect(()=>{setExpanded(new Set(children.keys()));setAttributesOpen(new Set());},[children]);

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

  const Node=({object,depth=0,seen=new Set<string>()}:{object:PatrimonialObject;depth?:number;seen?:Set<string>})=>{
    if(seen.has(object.object_id))return null;
    const next=new Set(seen);next.add(object.object_id);
    const kids=children.get(object.object_id)||[];
    const isExpanded=expanded.has(object.object_id);
    const capturedAttributes=observationsByObject.get(object.object_id)||[];
    const areAttributesOpen=attributesOpen.has(object.object_id);
    return <div className="ariane-tree-node" style={{'--depth':depth} as CSSProperties}>
      <div className="ariane-tree-row">
        <button className="ariane-tree-toggle" type="button" onClick={()=>toggleExpanded(object.object_id)} disabled={kids.length===0} aria-label={isExpanded?'Replier cet objet':'Déployer cet objet'} aria-expanded={kids.length?isExpanded:undefined}>
          {kids.length?(isExpanded?<ChevronDown/>:<ChevronRight/>):<span className="ariane-tree-toggle-spacer"/>}
        </button>
        <span className="ariane-type-badge">{object.object_type}</span>
        <div className="ariane-tree-main"><b>{object.label||object.object_id}</b><code>{object.object_id}</code></div>
        <div className="ariane-tree-meta">
          <button className="ariane-tree-attribute-button" type="button" onClick={()=>toggleAttributes(object.object_id)} disabled={capturedAttributes.length===0} aria-expanded={capturedAttributes.length?areAttributesOpen:undefined}>
            {capturedAttributes.length} attr.
          </button>
          {(anoCount.get(object.object_id)||0)>0&&<span className="ariane-badge-warn">{anoCount.get(object.object_id)} anomalie(s)</span>}
        </div>
      </div>
      {areAttributesOpen&&capturedAttributes.length>0&&<div className="ariane-tree-attributes">
        <div className="ariane-tree-attributes-header"><b>Attributs captés</b><button type="button" onClick={()=>onOpenAttributes(object.object_id)}>Afficher dans l’onglet Attributs</button></div>
        <div className="ariane-tree-attribute-list">
          {capturedAttributes.map(o=><div key={o.observation_id} className="ariane-tree-attribute-item">
            <span>{o.attribute_id}</span>
            <strong>{valueText(o.value_normalized??o.value_raw)}</strong>
            <small>{o.unit_normalized||o.unit_raw||'—'} · source {o.source_id}</small>
          </div>)}
        </div>
      </div>}
      {isExpanded&&kids.map(k=><Node key={k.object_id} object={k} depth={depth+1} seen={next}/>)}
    </div>;
  };

  return <>
    <div className="ariane-tree-toolbar">
      <span>{objects.length} objet(s)</span>
      <div><button type="button" onClick={()=>setExpanded(new Set(children.keys()))}>Tout déployer</button><button type="button" onClick={()=>setExpanded(new Set())}>Tout replier</button></div>
    </div>
    <div className="ariane-tree">{roots.map(r=><Node key={r.object_id} object={r}/>)}</div>
  </>;
}

export function CurrentDataPage(){
  const [programmes,setProgrammes]=useState<ProgrammeData[]>([]);
  const [programmeId,setProgrammeId]=useState('');
  const [data,setData]=useState<CurrentData|null>(null);
  const [tab,setTab]=useState<Tab>('structure');
  const [query,setQuery]=useState('');
  const [attributeFilters,setAttributeFilters]=useState<AttributeFilters>({object:'',attribute:'',value:'',unit:'',source:'',confidence:''});
  const [sourceFilters,setSourceFilters]=useState<SourceFilters>({id:'',filename:'',type:'',date:'',comment:''});
  const [relationFilters,setRelationFilters]=useState<RelationFilters>({id:'',type:'',source:'',target:'',evidence:'',confidence:''});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{let active=true;captureDataService.loadAllProgrammes().then(items=>{
    if(!active)return;
    setProgrammes(items);
    const first=items.find(p=>p.index.current?.available);
    if(first)setProgrammeId(first.index.programme_id);
  }).catch(e=>setError(e instanceof Error?e.message:String(e))).finally(()=>setLoading(false));return()=>{active=false}},[]);

  useEffect(()=>{if(!programmeId)return;const programme=programmes.find(p=>p.index.programme_id===programmeId);if(!programme)return;
    let active=true;setLoading(true);setError(null);
    captureDataService.loadCurrent(programme).then(v=>{if(active)setData(v)}).catch(e=>{if(active)setError(e instanceof Error?e.message:String(e))}).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[programmeId,programmes]);

  const q=query.trim().toLowerCase();
  const objects=useMemo(()=>!data?[]:data.structure.objects.filter(o=>!q||[o.object_id,o.object_type,o.label].some(v=>String(v||'').toLowerCase().includes(q))),[data,q]);
  const observations=useMemo(()=>!data?[]:data.observations.observations.filter(o=>(!q||[o.object_id,o.attribute_id,o.value_raw,o.value_normalized,o.source_id].some(v=>valueText(v).toLowerCase().includes(q)))&&matches(o.object_id,attributeFilters.object)&&matches(o.attribute_id,attributeFilters.attribute)&&matches(o.value_normalized??o.value_raw,attributeFilters.value)&&matches(o.unit_normalized||o.unit_raw,attributeFilters.unit)&&matches(`${o.source_id} ${o.page_or_plan||''}`,attributeFilters.source)&&matches(o.confidence?.score,attributeFilters.confidence)),[data,q,attributeFilters]);
  const anomalies=useMemo(()=>!data?[]:data.anomalies.anomalies.filter(a=>!q||[a.anomaly_id,a.anomaly_type,a.object_id,a.description].some(v=>String(v||'').toLowerCase().includes(q))),[data,q]);
  const sources=useMemo(()=>!data?[]:data.sources.sources.filter(s=>(!q||[s.source_id,s.filename,s.document_type,s.comment].some(v=>String(v||'').toLowerCase().includes(q)))&&matches(s.source_id,sourceFilters.id)&&matches(s.filename,sourceFilters.filename)&&matches(s.document_type,sourceFilters.type)&&matches(s.document_date,sourceFilters.date)&&matches(s.comment,sourceFilters.comment)),[data,q,sourceFilters]);
  const relations=useMemo(()=>!data?[]:data.relations.relations.filter(r=>(!q||[r.relation_id,r.relation_type,r.source_object_id,r.target_object_id].some(v=>String(v||'').toLowerCase().includes(q)))&&matches(r.relation_id,relationFilters.id)&&matches(r.relation_type,relationFilters.type)&&matches(r.source_object_id,relationFilters.source)&&matches(r.target_object_id||r.external_target,relationFilters.target)&&matches(r.page_or_plan,relationFilters.evidence)&&matches(r.confidence_score,relationFilters.confidence)),[data,q,relationFilters]);

  const openObjectAttributes=(objectId:string)=>{
    setTab('observations');
    setQuery('');
    setAttributeFilters({object:objectId,attribute:'',value:'',unit:'',source:'',confidence:''});
  };

  if(loading&&!data)return <section className="ariane-data panel ariane-empty"><LoaderCircle className="ariane-spin"/><h1>Structures & données courantes</h1><p>Chargement de CURRENT…</p></section>;
  if(error&&!data)return <section className="ariane-data panel ariane-empty"><h1>Structures & données courantes</h1><p className="ariane-error">{error}</p></section>;
  if(!data)return <section className="ariane-data panel ariane-empty"><h1>Structures & données courantes</h1><p>Aucun CURRENT disponible.</p></section>;

  return <div className="ariane-data">
    <section className="panel ariane-data-header ariane-current-header">
      <div><p className="eyebrow">CURRENT · DONNÉES CONSOLIDÉES</p><h1>{data.structure.structure_version}</h1><p>{programmeId}</p></div>
      <div className="ariane-header-actions">
        {programmes.length>1&&<select value={programmeId} onChange={e=>setProgrammeId(e.target.value)}>{programmes.filter(p=>p.index.current?.available).map(p=><option key={p.index.programme_id}>{p.index.programme_id}</option>)}</select>}
        <button className="button" onClick={()=>location.reload()}>Actualiser</button>
      </div>
    </section>

    <section className="ariane-kpi-grid">
      <div className="panel"><GitBranch/><b>{data.structure.objects.length}</b><span>objets</span></div>
      <div className="panel"><Database/><b>{data.observations.observations.length}</b><span>observations</span></div>
      <div className="panel"><AlertTriangle/><b>{data.anomalies.anomalies.length}</b><span>anomalies</span></div>
      <div className="panel"><FileText/><b>{data.sources.sources.length}</b><span>sources</span></div>
      <div className="panel"><Link2/><b>{data.relations.relations.length}</b><span>relations</span></div>
    </section>

    <section className="panel ariane-explorer">
      <div className="ariane-tabs">
        <button aria-current={tab==='structure'?'page':undefined} onClick={()=>setTab('structure')}>Structure</button>
        <button aria-current={tab==='observations'?'page':undefined} onClick={()=>setTab('observations')}>Attributs</button>
        <button aria-current={tab==='anomalies'?'page':undefined} onClick={()=>setTab('anomalies')}>Anomalies</button>
        <button aria-current={tab==='sources'?'page':undefined} onClick={()=>setTab('sources')}>Sources</button>
        <button aria-current={tab==='relations'?'page':undefined} onClick={()=>setTab('relations')}>Relations</button>
      </div>
      <label className="ariane-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher dans la vue…"/></label>

      {tab==='structure'&&<StructureTree objects={q?objects:data.structure.objects} data={data} onOpenAttributes={openObjectAttributes}/>}
      {tab==='observations'&&<div className="ariane-table-wrap"><table className="ariane-table"><thead><tr><th>Objet</th><th>Attribut</th><th>Valeur</th><th>Unité</th><th>Source</th><th>Confiance</th></tr><tr className="ariane-filter-row"><th><FilterInput label="Objet" value={attributeFilters.object} onChange={value=>setAttributeFilters(f=>({...f,object:value}))}/></th><th><FilterInput label="Attribut" value={attributeFilters.attribute} onChange={value=>setAttributeFilters(f=>({...f,attribute:value}))}/></th><th><FilterInput label="Valeur" value={attributeFilters.value} onChange={value=>setAttributeFilters(f=>({...f,value}))}/></th><th><FilterInput label="Unité" value={attributeFilters.unit} onChange={value=>setAttributeFilters(f=>({...f,unit:value}))}/></th><th><FilterInput label="Source" value={attributeFilters.source} onChange={value=>setAttributeFilters(f=>({...f,source:value}))}/></th><th><FilterInput label="Confiance" value={attributeFilters.confidence} onChange={value=>setAttributeFilters(f=>({...f,confidence:value}))}/></th></tr></thead><tbody>{observations.map(o=><tr key={o.observation_id}><td><code>{o.object_id}</code></td><td>{o.attribute_id}</td><td>{valueText(o.value_normalized??o.value_raw)}</td><td>{o.unit_normalized||o.unit_raw||'—'}</td><td><code>{o.source_id}</code><small>{o.page_or_plan||''}</small></td><td>{o.confidence?.score??'—'}</td></tr>)}</tbody></table></div>}
      {tab==='anomalies'&&<div className="ariane-anomaly-list">{anomalies.map(a=><article key={a.anomaly_id} className="ariane-anomaly"><div><span className="ariane-type-badge">{a.anomaly_type}</span><b>{a.anomaly_id}</b><span className={a.resolution_status==='RESOLUE'?'ariane-badge-ok':'ariane-badge-warn'}>{a.resolution_status||'OUVERTE'}</span></div><p>{a.description}</p><small>{a.object_id&&<>Objet <code>{a.object_id}</code> · </>}{a.source_reference||a.source_id||''}</small></article>)}</div>}
      {tab==='sources'&&<div className="ariane-table-wrap"><table className="ariane-table"><thead><tr><th>ID</th><th>Fichier</th><th>Type</th><th>Date</th><th>Commentaire</th></tr><tr className="ariane-filter-row"><th><FilterInput label="ID" value={sourceFilters.id} onChange={value=>setSourceFilters(f=>({...f,id:value}))}/></th><th><FilterInput label="Fichier" value={sourceFilters.filename} onChange={value=>setSourceFilters(f=>({...f,filename:value}))}/></th><th><FilterInput label="Type" value={sourceFilters.type} onChange={value=>setSourceFilters(f=>({...f,type:value}))}/></th><th><FilterInput label="Date" value={sourceFilters.date} onChange={value=>setSourceFilters(f=>({...f,date:value}))}/></th><th><FilterInput label="Commentaire" value={sourceFilters.comment} onChange={value=>setSourceFilters(f=>({...f,comment:value}))}/></th></tr></thead><tbody>{sources.map(s=><tr key={s.source_id}><td><code>{s.source_id}</code></td><td>{s.filename}</td><td>{s.document_type||'—'}</td><td>{s.document_date||'—'}</td><td>{s.comment||'—'}</td></tr>)}</tbody></table></div>}
      {tab==='relations'&&<div className="ariane-table-wrap"><table className="ariane-table"><thead><tr><th>ID</th><th>Type</th><th>Source</th><th>Cible</th><th>Preuve</th><th>Confiance</th></tr><tr className="ariane-filter-row"><th><FilterInput label="ID" value={relationFilters.id} onChange={value=>setRelationFilters(f=>({...f,id:value}))}/></th><th><FilterInput label="Type" value={relationFilters.type} onChange={value=>setRelationFilters(f=>({...f,type:value}))}/></th><th><FilterInput label="Source" value={relationFilters.source} onChange={value=>setRelationFilters(f=>({...f,source:value}))}/></th><th><FilterInput label="Cible" value={relationFilters.target} onChange={value=>setRelationFilters(f=>({...f,target:value}))}/></th><th><FilterInput label="Preuve" value={relationFilters.evidence} onChange={value=>setRelationFilters(f=>({...f,evidence:value}))}/></th><th><FilterInput label="Confiance" value={relationFilters.confidence} onChange={value=>setRelationFilters(f=>({...f,confidence:value}))}/></th></tr></thead><tbody>{relations.map(r=><tr key={r.relation_id}><td><code>{r.relation_id}</code></td><td>{r.relation_type}</td><td><code>{r.source_object_id}</code></td><td><code>{r.target_object_id||r.external_target||'—'}</code></td><td>{r.page_or_plan||'—'}</td><td>{r.confidence_score??'—'}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
