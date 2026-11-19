import {useEffect,useState} from 'react';
import {CheckCircle2,LoaderCircle,ShieldCheck,XCircle} from 'lucide-react';
import {captureDataService,type ProgrammeData,type ValidationData} from '../services/captureDataService';

type ValidationView={programme:ProgrammeData;structureVersion:string;data?:ValidationData;error?:string};

const textValue=(v:unknown)=>typeof v==='string'?v:JSON.stringify(v);

export function ValidationDataPage(){
  const [items,setItems]=useState<ValidationView[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{let active=true;captureDataService.loadAllProgrammes().then(async programmes=>{
    const targets=programmes.flatMap(programme=>programme.index.structures.map(s=>({programme,structureVersion:s.structure_version})));
    const loaded=await Promise.all(targets.map(async t=>{try{return {...t,data:await captureDataService.loadValidation(t.programme.index.programme_id,t.structureVersion)}}catch(e){return {...t,error:e instanceof Error?e.message:String(e)}}}));
    if(active)setItems(loaded);
  }).catch(e=>{if(active)setError(e instanceof Error?e.message:String(e))}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);

  if(loading)return <section className="panel ariane-empty"><LoaderCircle className="ariane-spin"/><h1>Validations structurelles</h1><p>Chargement des décisions humaines…</p></section>;
  if(error)return <section className="panel ariane-empty"><h1>Validations structurelles</h1><p className="ariane-error">{error}</p></section>;

  return <div className="ariane-data">
    <section className="panel ariane-data-header"><div><p className="eyebrow">TRACES DE DÉCISION HUMAINE</p><h1>Validations structurelles</h1><p>Lecture des fichiers <code>validations/STR-xxx.json</code>.</p></div></section>
    {items.length===0&&<section className="panel ariane-empty"><h2>Aucune validation</h2></section>}
    {items.map(item=><article className="panel ariane-validation" key={item.programme.index.programme_id+'-'+item.structureVersion}>
      {item.error?<p className="ariane-error">{item.error}</p>:item.data&&<>
        <header><div><ShieldCheck/><div><p className="eyebrow">{item.programme.index.programme_id}</p><h2>{item.data.target_structure_version}</h2><span>Depuis {item.data.source_structure_version||'—'} · capture {item.data.source_capture_id||'—'}</span></div></div><span className="ariane-badge-ok"><CheckCircle2/>Approbation humaine</span></header>
        <section className="ariane-validation-kpis">
          <div><b>{item.data.promoted_to_current?.sources??0}</b><span>sources</span></div>
          <div><b>{item.data.promoted_to_current?.observations??0}</b><span>observations</span></div>
          <div><b>{item.data.promoted_to_current?.relations??0}</b><span>relations</span></div>
          <div><b>{item.data.promoted_to_current?.anomalies??0}</b><span>anomalies</span></div>
        </section>
        <div className="ariane-validation-columns">
          <section><h3>Décisions demandées</h3><ul>{(item.data.requested_changes||[]).map((c,i)=><li key={i}>{c}</li>)}</ul></section>
          <section><h3>Changements appliqués</h3><ul>{(item.data.applied_changes||[]).map((c,i)=><li key={i}><code>{String(c.object_id||'')}</code> · {String(c.operation||'')} · {String(c.result||'')}</li>)}</ul></section>
        </div>
        {(item.data.not_applied_changes?.length||0)>0&&<section className="ariane-validation-warning"><XCircle/><div><h3>Changements non appliqués</h3>{item.data.not_applied_changes?.map((c,i)=><p key={i}>{textValue(c.reason||c.requested_change||c)}</p>)}</div></section>}
        <footer>Validation <code>{item.data.validation_id}</code> · ARIANE {item.data.ariane_version} · CAPTURE historiques modifiées : {item.data.historical_captures_modified?'oui':'non'} · Validation autonome IA : {item.data.autonomous_ai_validation?'oui':'non'}</footer>
      </>}
    </article>)}
  </div>;
}
