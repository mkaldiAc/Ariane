import {useEffect,useMemo,useState} from 'react';
import type {CSSProperties} from 'react';
import {AlertTriangle,Database,FileText,GitBranch,Link2,LoaderCircle,Search} from 'lucide-react';
import {captureDataService,type CurrentData,type PatrimonialObject,type ProgrammeData} from '../services/captureDataService';

type Tab='structure'|'observations'|'anomalies'|'sources'|'relations';

const valueText=(value:unknown)=>{
  if(value===null||value===undefined)return '—';
  if(typeof value==='object')return JSON.stringify(value);
  return String(value);
};

function StructureTree({objects,data}:{objects:PatrimonialObject[];data:CurrentData}){
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
  const obsCount=useMemo(()=>{
    const m=new Map<string,number>();
    data.observations.observations.forEach(o=>m.set(o.object_id,(m.get(o.object_id)||0)+1));
    return m;
  },[data]);
  const anoCount=useMemo(()=>{
    const m=new Map<string,number>();
    data.anomalies.anomalies.forEach(a=>{if(a.object_id)m.set(a.object_id,(m.get(a.object_id)||0)+1)});
    return m;
  },[data]);

  const Node=({object,depth=0,seen=new Set<string>()}:{object:PatrimonialObject;depth?:number;seen?:Set<string>})=>{
    if(seen.has(object.object_id))return null;
    const next=new Set(seen);next.add(object.object_id);
    const kids=children.get(object.object_id)||[];
    return <div className="ariane-tree-node" style={{'--depth':depth} as CSSProperties}>
      <div className="ariane-tree-row">
        <span className="ariane-type-badge">{object.object_type}</span>
        <div className="ariane-tree-main"><b>{object.label||object.object_id}</b><code>{object.object_id}</code></div>
        <div className="ariane-tree-meta"><span>{obsCount.get(object.object_id)||0} attr.</span>{(anoCount.get(object.object_id)||0)>0&&<span className="ariane-badge-warn">{anoCount.get(object.object_id)} anomalie(s)</span>}</div>
      </div>
      {kids.map(k=><Node key={k.object_id} object={k} depth={depth+1} seen={next}/>)}
    </div>;
  };

  return <div className="ariane-tree">{roots.map(r=><Node key={r.object_id} object={r}/>)}</div>;
}

export function CurrentDataPage(){
  const [programmes,setProgrammes]=useState<ProgrammeData[]>([]);
  const [programmeId,setProgrammeId]=useState('');
  const [data,setData]=useState<CurrentData|null>(null);
  const [tab,setTab]=useState<Tab>('structure');
  const [query,setQuery]=useState('');
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
  const observations=useMemo(()=>!data?[]:data.observations.observations.filter(o=>!q||[o.object_id,o.attribute_id,o.value_raw,o.value_normalized,o.source_id].some(v=>valueText(v).toLowerCase().includes(q))),[data,q]);
  const anomalies=useMemo(()=>!data?[]:data.anomalies.anomalies.filter(a=>!q||[a.anomaly_id,a.anomaly_type,a.object_id,a.description].some(v=>String(v||'').toLowerCase().includes(q))),[data,q]);
  const sources=useMemo(()=>!data?[]:data.sources.sources.filter(s=>!q||[s.source_id,s.filename,s.document_type,s.comment].some(v=>String(v||'').toLowerCase().includes(q))),[data,q]);
  const relations=useMemo(()=>!data?[]:data.relations.relations.filter(r=>!q||[r.relation_id,r.relation_type,r.source_object_id,r.target_object_id].some(v=>String(v||'').toLowerCase().includes(q))),[data,q]);

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

      {tab==='structure'&&<StructureTree objects={q?objects:data.structure.objects} data={data}/>}
      {tab==='observations'&&<div className="ariane-table-wrap"><table className="ariane-table"><thead><tr><th>Objet</th><th>Attribut</th><th>Valeur</th><th>Unité</th><th>Source</th><th>Confiance</th></tr></thead><tbody>{observations.map(o=><tr key={o.observation_id}><td><code>{o.object_id}</code></td><td>{o.attribute_id}</td><td>{valueText(o.value_normalized??o.value_raw)}</td><td>{o.unit_normalized||o.unit_raw||'—'}</td><td><code>{o.source_id}</code><small>{o.page_or_plan||''}</small></td><td>{o.confidence?.score??'—'}</td></tr>)}</tbody></table></div>}
      {tab==='anomalies'&&<div className="ariane-anomaly-list">{anomalies.map(a=><article key={a.anomaly_id} className="ariane-anomaly"><div><span className="ariane-type-badge">{a.anomaly_type}</span><b>{a.anomaly_id}</b><span className={a.resolution_status==='RESOLUE'?'ariane-badge-ok':'ariane-badge-warn'}>{a.resolution_status||'OUVERTE'}</span></div><p>{a.description}</p><small>{a.object_id&&<>Objet <code>{a.object_id}</code> · </>}{a.source_reference||a.source_id||''}</small></article>)}</div>}
      {tab==='sources'&&<div className="ariane-table-wrap"><table className="ariane-table"><thead><tr><th>ID</th><th>Fichier</th><th>Type</th><th>Date</th><th>Commentaire</th></tr></thead><tbody>{sources.map(s=><tr key={s.source_id}><td><code>{s.source_id}</code></td><td>{s.filename}</td><td>{s.document_type||'—'}</td><td>{s.document_date||'—'}</td><td>{s.comment||'—'}</td></tr>)}</tbody></table></div>}
      {tab==='relations'&&<div className="ariane-table-wrap"><table className="ariane-table"><thead><tr><th>ID</th><th>Type</th><th>Source</th><th>Cible</th><th>Preuve</th><th>Confiance</th></tr></thead><tbody>{relations.map(r=><tr key={r.relation_id}><td><code>{r.relation_id}</code></td><td>{r.relation_type}</td><td><code>{r.source_object_id}</code></td><td><code>{r.target_object_id||r.external_target||'—'}</code></td><td>{r.page_or_plan||'—'}</td><td>{r.confidence_score??'—'}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
