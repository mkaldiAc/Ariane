import {useEffect,useMemo,useState} from 'react';
import {Archive,Boxes,Database,ExternalLink,GitBranch,LoaderCircle} from 'lucide-react';
import {captureDataService,type ProgrammeData} from '../services/captureDataService';

type Mode='programmes'|'captures'|'structures'|'validations';

const title:Record<Mode,string>={
  programmes:'Programmes',
  captures:'Captations',
  structures:'Structures',
  validations:'Validations structurelles'
};

export function RepositoryDataPage({mode}:{mode:Mode}){
  const [programmes,setProgrammes]=useState<ProgrammeData[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{let active=true;setLoading(true);captureDataService.loadAllProgrammes()
    .then(data=>{if(active){setProgrammes(data);setError(null)}})
    .catch(e=>{if(active)setError(e instanceof Error?e.message:String(e))})
    .finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[]);

  const captures=useMemo(()=>programmes.flatMap(p=>p.index.captures.map(c=>({programme_id:p.index.programme_id,...c}))),[programmes]);
  const structures=useMemo(()=>programmes.flatMap(p=>p.index.structures.map(s=>({programme_id:p.index.programme_id,...s}))),[programmes]);

  if(loading)return <section className="ariane-data panel ariane-empty"><LoaderCircle className="ariane-spin"/><h1>{title[mode]}</h1><p>Chargement de Ariane_capture_data…</p></section>;
  if(error)return <section className="ariane-data panel ariane-empty"><h1>{title[mode]}</h1><p className="ariane-error">{error}</p></section>;

  return <div className="ariane-data">
    <section className="panel ariane-data-header"><div><p className="eyebrow">DONNÉES STATIQUES · GIT</p><h1>{title[mode]}</h1><p>Lecture directe du catalogue JSON de <code>mkaldiAc/Ariane_capture_data</code>.</p></div><button className="button" onClick={()=>location.reload()}>Actualiser</button></section>

    {mode==='programmes'&&<section className="ariane-data-grid">
      {programmes.map(p=><article className="panel ariane-data-card" key={p.index.programme_id}><Database/><h2>{p.index.programme_id}</h2><p>{p.index.captures.length} capture(s) · {p.index.structures.length} structure(s) validée(s)</p><span>STR courante : {p.index.current?.structure_version||'aucune'}</span></article>)}
    </section>}

    {mode==='captures'&&<section className="ariane-data-list panel">
      {captures.map(c=><article key={c.programme_id+'-'+c.capture_id}><Archive/><div><b>{c.capture_id}</b><span>{c.programme_id} · séquence {c.sequence} · {c.mode}</span></div><a href={captureDataService.rawUrl(c.path+'/capture.json')} target="_blank" rel="noreferrer"><ExternalLink/>JSON</a></article>)}
    </section>}

    {mode==='structures'&&<section className="ariane-data-list panel">
      {structures.map(s=><article key={s.programme_id+'-'+s.structure_version}><GitBranch/><div><b>{s.structure_version}</b><span>{s.programme_id}</span></div><a href={captureDataService.rawUrl(s.path+'/structure.json')} target="_blank" rel="noreferrer"><ExternalLink/>JSON</a></article>)}
    </section>}

    {mode==='validations'&&<section className="ariane-data-list panel">
      {programmes.flatMap(p=>p.index.structures.map((s,i)=><article key={p.index.programme_id+'-'+s.structure_version}><Boxes/><div><b>{s.structure_version}</b><span>{p.index.programme_id} · validation structurelle #{i+1}</span></div></article>))}
    </section>}

    {((mode==='programmes'&&programmes.length===0)||(mode==='captures'&&captures.length===0)||(mode==='structures'&&structures.length===0)||(mode==='validations'&&structures.length===0))&&
      <section className="panel ariane-empty"><h2>Aucune donnée pour l'instant</h2><p>Le catalogue est prêt. La première captation exécutée dans ChatGPT alimentera automatiquement cette vue.</p></section>}
  </div>;
}
