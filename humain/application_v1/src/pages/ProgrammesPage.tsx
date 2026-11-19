import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,Boxes,CalendarDays,ChevronRight,Clipboard,Database,ExternalLink,FileText,GitBranch,Layers3,LoaderCircle,Plus,X} from 'lucide-react';
import {CurrentDataPage} from './CurrentDataPage';
import {StructureEvolutionPage} from './StructureEvolutionPage';
import {buildIncrementalPrompt,buildInitialisationPrompt,normalizeArianeId} from '../execution/promptBuilders';
import {chatLaunchErrorMessage,clipboardErrorMessage,copyPromptAndMaybeOpenChat} from '../utils/promptActions';
import {
  captureDataService,
  type CaptureDetail,
  type ProgrammeCurrentMetrics,
  type ProgrammeData,
  type StructureCandidate,
  type StructureDetail
} from '../services/captureDataService';

type Route=
  |{kind:'programmes'}
  |{kind:'programme';programmeId:string}
  |{kind:'current';programmeId:string}
  |{kind:'captures';programmeId:string}
  |{kind:'capture';programmeId:string;captureId:string}
  |{kind:'structures';programmeId:string}
  |{kind:'structure';programmeId:string;structureVersion:string}
  |{kind:'candidates';programmeId:string;structureVersion:string}
  |{kind:'evolve';programmeId:string};

type BreadcrumbItem={label:string;route?:Route};

const captureDate=(capture:CaptureDetail)=>{
  const metadata=capture.metadata;
  return metadata.capture_date||metadata.captured_at||metadata.created_at||metadata.date||null;
};

const formatDate=(value:string|null|undefined)=>{
  if(!value)return 'Non renseignée';
  const date=new Date(value);
  return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium'}).format(date);
};

function Breadcrumb({items,onNavigate,onBack}:{items:BreadcrumbItem[];onNavigate:(route:Route)=>void;onBack?:()=>void}){
  return <div className="panel ariane-programme-breadcrumb">
    {onBack&&<button type="button" className="ariane-breadcrumb-back" onClick={onBack}><ArrowLeft/>Retour</button>}
    <nav aria-label="Fil d’Ariane">
      {items.map((item,index)=><span key={index}>
        {index>0&&<ChevronRight/>}
        {item.route?<button type="button" onClick={()=>onNavigate(item.route!)}>{item.label}</button>:<b>{item.label}</b>}
      </span>)}
    </nav>
  </div>;
}

export function ProgrammesPage(){
  const [programmes,setProgrammes]=useState<ProgrammeData[]>([]);
  const [metrics,setMetrics]=useState<Record<string,ProgrammeCurrentMetrics>>({});
  const [route,setRoute]=useState<Route>({kind:'programmes'});
  const [captureDetails,setCaptureDetails]=useState<CaptureDetail[]>([]);
  const [structureDetail,setStructureDetail]=useState<StructureDetail|null>(null);
  const [structureCandidates,setStructureCandidates]=useState<StructureCandidate[]>([]);
  const [loading,setLoading]=useState(true);
  const [detailLoading,setDetailLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [chatLaunchError,setChatLaunchError]=useState<string|null>(null);
  const [newProgrammeOpen,setNewProgrammeOpen]=useState(false);
  const [newProgrammeName,setNewProgrammeName]=useState('');
  const [initialCaptureName,setInitialCaptureName]=useState('APD_PLAN');
  const [promptCopied,setPromptCopied]=useState(false);
  const [initialClipboardError,setInitialClipboardError]=useState<string|null>(null);
  const [incrementalProgrammeId,setIncrementalProgrammeId]=useState<string|null>(null);
  const [incrementalCaptureName,setIncrementalCaptureName]=useState('');
  const [incrementalPromptCopied,setIncrementalPromptCopied]=useState(false);
  const [incrementalClipboardError,setIncrementalClipboardError]=useState<string|null>(null);

  useEffect(()=>{let active=true;setLoading(true);
    captureDataService.loadAllProgrammes().then(async items=>{
      if(!active)return;
      setProgrammes(items);
      const entries=await Promise.all(items.map(async programme=>{
        try{return [programme.index.programme_id,await captureDataService.loadCurrentMetrics(programme)] as const}
        catch{return [programme.index.programme_id,{objects:0,observations:0,structureVersion:null}] as const}
      }));
      if(active)setMetrics(Object.fromEntries(entries));
    }).catch(e=>{if(active)setError(e instanceof Error?e.message:String(e))})
      .finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[]);

  const selectedProgramme=useMemo(()=>{
    if(route.kind==='programmes')return null;
    return programmes.find(programme=>programme.index.programme_id===route.programmeId)||null;
  },[route,programmes]);

  useEffect(()=>{
    if(route.kind!=='captures'&&route.kind!=='capture')return;
    if(!selectedProgramme)return;
    let active=true;setDetailLoading(true);setError(null);setCaptureDetails([]);
    Promise.all(selectedProgramme.index.captures.map(entry=>captureDataService.loadCaptureDetail(entry)))
      .then(items=>{if(active)setCaptureDetails(items)})
      .catch(e=>{if(active)setError(e instanceof Error?e.message:String(e))})
      .finally(()=>{if(active)setDetailLoading(false)});
    return()=>{active=false};
  },[route.kind,selectedProgramme]);

  useEffect(()=>{
    if(route.kind!=='structure'&&route.kind!=='candidates')return;
    if(!selectedProgramme)return;
    const structureVersion=route.structureVersion;
    const entry=selectedProgramme.index.structures.find(item=>item.structure_version===structureVersion);
    if(!entry)return;
    let active=true;setDetailLoading(true);setError(null);setStructureDetail(null);setStructureCandidates([]);
    captureDataService.loadStructureDetail(selectedProgramme.index.programme_id,entry).then(async detail=>{
      const candidates=await captureDataService.loadCandidatesForStructure(selectedProgramme,detail.structure);
      if(!active)return;
      setStructureDetail(detail);
      setStructureCandidates(candidates);
    }).catch(e=>{if(active)setError(e instanceof Error?e.message:String(e))})
      .finally(()=>{if(active)setDetailLoading(false)});
    return()=>{active=false};
  },[route,selectedProgramme]);

  const navigate=(next:Route)=>{setError(null);setChatLaunchError(null);setRoute(next)};
  const newProgrammeId=normalizeArianeId(newProgrammeName);
  const initialCaptureId=normalizeArianeId(initialCaptureName);
  const programmeAlreadyExists=programmes.some(programme=>programme.index.programme_id===newProgrammeId);
  const initialisationReady=Boolean(newProgrammeId&&initialCaptureId&&!programmeAlreadyExists);

  const copyInitialisationPrompt=async(openChat=false)=>{
    if(!initialisationReady)return;
    setInitialClipboardError(null);
    setChatLaunchError(null);
    const prompt=buildInitialisationPrompt({programmeId:newProgrammeId,captureId:initialCaptureId});
    try{
      const launch=await copyPromptAndMaybeOpenChat(prompt,openChat);
      setPromptCopied(true);
      setNewProgrammeOpen(false);
      window.setTimeout(()=>setPromptCopied(false),1600);
      setChatLaunchError(chatLaunchErrorMessage(launch));
    }catch{
      setInitialClipboardError(clipboardErrorMessage());
    }
  };

  const openIncremental=(programmeId:string)=>{
    setIncrementalProgrammeId(current=>current===programmeId?null:programmeId);
    setIncrementalCaptureName('');
    setIncrementalPromptCopied(false);
    setIncrementalClipboardError(null);
    setChatLaunchError(null);
  };

  const copyIncrementalPrompt=async(programme:ProgrammeData,openChat=false)=>{
    const captureId=normalizeArianeId(incrementalCaptureName);
    const structureVersion=programme.index.current.structure_version;
    const captureAlreadyExists=programme.index.captures.some(capture=>capture.capture_id===captureId);
    if(!captureId||!structureVersion||captureAlreadyExists)return;
    const prompt=buildIncrementalPrompt({
      programmeId:programme.index.programme_id,
      captureId,
      structureVersion
    });
    setIncrementalClipboardError(null);
    setChatLaunchError(null);
    try{
      const launch=await copyPromptAndMaybeOpenChat(prompt,openChat);
      setIncrementalPromptCopied(true);
      setIncrementalProgrammeId(null);
      window.setTimeout(()=>setIncrementalPromptCopied(false),1600);
      setChatLaunchError(chatLaunchErrorMessage(launch));
    }catch{
      setIncrementalClipboardError(clipboardErrorMessage());
    }
  };

  const breadcrumbItems=():BreadcrumbItem[]=>{
    const base:BreadcrumbItem[]=[{label:'Programmes',route:route.kind==='programmes'?undefined:{kind:'programmes'}}];
    if(!selectedProgramme)return base;
    base.push({label:selectedProgramme.index.programme_id,route:route.kind==='programme'?undefined:{kind:'programme',programmeId:selectedProgramme.index.programme_id}});
    if(route.kind==='current')base.push({label:'Données courantes'});
    if(route.kind==='captures')base.push({label:'Captations'});
    if(route.kind==='capture')base.push({label:'Captations',route:{kind:'captures',programmeId:route.programmeId}},{label:route.captureId});
    if(route.kind==='structures')base.push({label:'Structures validées'});
    if(route.kind==='structure')base.push({label:'Structures validées',route:{kind:'structures',programmeId:route.programmeId}},{label:route.structureVersion});
    if(route.kind==='evolve')base.push({label:'Faire évoluer structure patrimoniale'});
    if(route.kind==='candidates')base.push(
      {label:'Structures validées',route:{kind:'structures',programmeId:route.programmeId}},
      {label:route.structureVersion,route:{kind:'structure',programmeId:route.programmeId,structureVersion:route.structureVersion}},
      {label:'Candidats structure'}
    );
    return base;
  };

  const backRoute=():Route|undefined=>{
    if(route.kind==='programmes')return undefined;
    if(route.kind==='programme')return {kind:'programmes'};
    if(route.kind==='evolve')return {kind:'programmes'};
    if(route.kind==='current'||route.kind==='captures'||route.kind==='structures')return {kind:'programme',programmeId:route.programmeId};
    if(route.kind==='capture')return {kind:'captures',programmeId:route.programmeId};
    if(route.kind==='structure')return {kind:'structures',programmeId:route.programmeId};
    if(route.kind==='candidates')return {kind:'structure',programmeId:route.programmeId,structureVersion:route.structureVersion};
  };

  if(loading)return <section className="panel ariane-empty"><LoaderCircle className="ariane-spin"/><h1>Programmes</h1><p>Chargement des programmes ARIANE…</p></section>;

  const back=backRoute();

  return <div className="ariane-data ariane-programme-browser">
    <Breadcrumb items={breadcrumbItems()} onNavigate={navigate} onBack={back?()=>navigate(back):undefined}/>

    {error&&<section className="panel ariane-programme-error"><p className="ariane-error">{error}</p></section>}
    {chatLaunchError&&<section className="panel ariane-programme-error"><p className="ariane-error">{chatLaunchError}</p></section>}

    {route.kind==='programmes'&&<>
      <section className="panel ariane-data-header">
        <div><p className="eyebrow">ARIANE · PROGRAMMES</p><h1>Programmes</h1><p>Accédez aux données courantes, aux captations et aux structures validées de chaque programme.</p></div>
        <div className="ariane-programmes-header-actions">
          <span className="ariane-count-pill">{programmes.length} programme(s)</span>
          <button type="button" className="button button-action ariane-new-programme-button" onClick={()=>{setNewProgrammeOpen(value=>!value);setInitialClipboardError(null);setChatLaunchError(null)}}>
            {newProgrammeOpen?<X/>:<Plus/>}{newProgrammeOpen?'Fermer':'Nouveau programme'}
          </button>
        </div>
      </section>
      {newProgrammeOpen&&<section className="panel action-panel ariane-new-programme">
        <header>
          <div><h2>Initialiser un nouveau programme</h2><p>Renseignez uniquement les informations nécessaires. ARIANE construit le prompt technique.</p></div>
        </header>
        <div className="ariane-new-programme-form">
          <label>
            <span>Nom du programme</span>
            <input autoFocus value={newProgrammeName} onChange={event=>setNewProgrammeName(event.target.value)} placeholder="Ex. Brécé Le Grand Domaine"/>
            <small>Identifiant généré : <code>{newProgrammeId||'—'}</code></small>
          </label>
          <label>
            <span>Nom de la captation initiale</span>
            <input value={initialCaptureName} onChange={event=>setInitialCaptureName(event.target.value)} placeholder="APD_PLAN"/>
            <small>Identifiant généré : <code>{initialCaptureId||'—'}</code></small>
          </label>
        </div>
        {programmeAlreadyExists&&<p className="ariane-new-programme-warning">Ce programme existe déjà dans ARIANE. Utilisez une captation incrémentale depuis sa fiche programme.</p>}
        {initialClipboardError&&<p className="ariane-new-programme-warning">{initialClipboardError}</p>}
        <div className="ariane-new-programme-actions">
          <p><b>Étape suivante :</b> ouvrez ChatGPT, joignez les documents du jeu initial, collez le prompt puis envoyez.</p>
          <button type="button" className="button button-action" disabled={!initialisationReady} onClick={()=>void copyInitialisationPrompt(false)}><Clipboard/>{promptCopied?'Prompt copié':'Copier le prompt'}</button>
          <button type="button" className="button button-action" disabled={!initialisationReady} onClick={()=>void copyInitialisationPrompt(true)}><ExternalLink/>Copier et ouvrir ChatGPT</button>
        </div>
      </section>}
      <section className="ariane-programme-grid">
        {programmes.map(programme=>{
          const current=metrics[programme.index.programme_id];
          const programmeId=programme.index.programme_id;
          const incrementalOpen=incrementalProgrammeId===programmeId;
          const incrementalCaptureId=normalizeArianeId(incrementalCaptureName);
          const currentStructureVersion=programme.index.current.structure_version;
          const incrementalCaptureExists=programme.index.captures.some(capture=>capture.capture_id===incrementalCaptureId);
          const incrementalReady=Boolean(incrementalCaptureId&&currentStructureVersion&&!incrementalCaptureExists);
          return <article className="panel ariane-programme-card" key={programmeId}>
            <header>
              <Database/>
              <div><p className="eyebrow">PROGRAMME</p><h2>{programmeId}</h2></div>
              <div className="ariane-programme-scenario-actions">
                <button type="button" className="button button-action ariane-incremental-launcher" onClick={()=>openIncremental(programmeId)}>
                  {incrementalOpen?<X/>:<Plus/>}{incrementalOpen?'Fermer':'Nouvelle captation'}
                </button>
                <button type="button" className="button button-action" disabled={!currentStructureVersion} onClick={()=>{setIncrementalProgrammeId(null);setNewProgrammeOpen(false);navigate({kind:'evolve',programmeId})}}>
                  <GitBranch/>Faire évoluer structure patrimoniale
                </button>
              </div>
            </header>
            {incrementalOpen&&<section className="action-panel ariane-incremental-panel">
              <div className="ariane-incremental-heading">
                <div><h3>Captation incrémentale</h3><p>Le programme et la structure courante sont renseignés automatiquement.</p></div>
                <span>Structure : <code>{currentStructureVersion||'Aucune structure validée'}</code></span>
              </div>
              {!currentStructureVersion?<p className="ariane-new-programme-warning">Une captation incrémentale nécessite une structure CURRENT validée. Validez d’abord la structure initiale.</p>:<>
                <label>
                  <span>Nom de la nouvelle captation</span>
                  <input autoFocus value={incrementalCaptureName} onChange={event=>setIncrementalCaptureName(event.target.value)} placeholder="Ex. PC"/>
                  <small>Identifiant généré : <code>{incrementalCaptureId||'—'}</code></small>
                </label>
                {incrementalCaptureExists&&<p className="ariane-new-programme-warning">Cet identifiant de captation existe déjà pour ce programme.</p>}
                {incrementalClipboardError&&<p className="ariane-new-programme-warning">{incrementalClipboardError}</p>}
                <div className="ariane-incremental-actions">
                  <p><b>Étape suivante :</b> joignez uniquement les nouveaux documents dans ChatGPT, collez le prompt puis envoyez.</p>
                  <button type="button" className="button button-action" disabled={!incrementalReady} onClick={()=>void copyIncrementalPrompt(programme,false)}><Clipboard/>{incrementalPromptCopied?'Prompt copié':'Copier le prompt'}</button>
                  <button type="button" className="button button-action" disabled={!incrementalReady} onClick={()=>void copyIncrementalPrompt(programme,true)}><ExternalLink/>Copier et ouvrir ChatGPT</button>
                </div>
              </>}
            </section>}
            <div className="ariane-programme-actions">
              <button type="button" onClick={()=>navigate({kind:'current',programmeId:programme.index.programme_id})}>
                <span><Database/><b>Données courantes</b></span>
                <small>{current?.objects??0} objets · {current?.observations??0} observations</small>
                <ChevronRight/>
              </button>
              <button type="button" onClick={()=>navigate({kind:'captures',programmeId:programme.index.programme_id})}>
                <span><Boxes/><b>Captations</b></span>
                <small>{programme.index.captures.length} captation(s)</small>
                <ChevronRight/>
              </button>
              <button type="button" onClick={()=>navigate({kind:'structures',programmeId:programme.index.programme_id})}>
                <span><GitBranch/><b>Structures validées</b></span>
                <small>{programme.index.structures.length} structure(s)</small>
                <ChevronRight/>
              </button>
            </div>
          </article>;
        })}
      </section>
    </>}

    {route.kind==='programme'&&selectedProgramme&&<>
      <section className="panel ariane-data-header"><div><p className="eyebrow">PROGRAMME</p><h1>{selectedProgramme.index.programme_id}</h1><p>Sélectionnez les données que vous souhaitez consulter.</p></div></section>
      <section className="ariane-programme-section-grid">
        <button className="panel ariane-navigation-card" type="button" onClick={()=>navigate({kind:'current',programmeId:selectedProgramme.index.programme_id})}><Database/><h2>Données courantes</h2><p>{metrics[selectedProgramme.index.programme_id]?.objects??0} objets · {metrics[selectedProgramme.index.programme_id]?.observations??0} observations</p><ChevronRight/></button>
        <button className="panel ariane-navigation-card" type="button" onClick={()=>navigate({kind:'captures',programmeId:selectedProgramme.index.programme_id})}><Boxes/><h2>Captations</h2><p>{selectedProgramme.index.captures.length} captation(s)</p><ChevronRight/></button>
        <button className="panel ariane-navigation-card" type="button" onClick={()=>navigate({kind:'structures',programmeId:selectedProgramme.index.programme_id})}><GitBranch/><h2>Structures validées</h2><p>{selectedProgramme.index.structures.length} structure(s)</p><ChevronRight/></button>
      </section>
    </>}

    {route.kind==='current'&&selectedProgramme&&<CurrentDataPage programmeId={selectedProgramme.index.programme_id}/>}

    {route.kind==='evolve'&&selectedProgramme&&<StructureEvolutionPage
      programme={selectedProgramme}
      onBack={()=>navigate({kind:'programmes'})}
      onChatLaunchError={setChatLaunchError}
    />}

    {route.kind==='captures'&&selectedProgramme&&<>
      <section className="panel ariane-data-header"><div><p className="eyebrow">CAPTATIONS</p><h1>Captations réalisées</h1><p>{selectedProgramme.index.programme_id}</p></div><span className="ariane-count-pill">{selectedProgramme.index.captures.length}</span></section>
      {detailLoading?<section className="panel ariane-empty"><LoaderCircle className="ariane-spin"/><p>Chargement des captations…</p></section>:
      <section className="ariane-capture-grid">{captureDetails.map(capture=><button className="panel ariane-capture-card" type="button" key={capture.entry.capture_id} onClick={()=>navigate({kind:'capture',programmeId:selectedProgramme.index.programme_id,captureId:capture.entry.capture_id})}>
        <header><Boxes/><div><p className="eyebrow">CAPTURE #{capture.entry.sequence}</p><h2>{capture.entry.capture_id}</h2></div><ChevronRight/></header>
        <dl><div><dt>Date de captation</dt><dd>{formatDate(captureDate(capture))}</dd></div><div><dt>Documents mobilisés</dt><dd>{capture.sources.length}</dd></div><div><dt>Mode</dt><dd>{capture.entry.mode}</dd></div><div><dt>Statut</dt><dd>{capture.metadata.status||(capture.metadata.immutable?'Terminée':'En cours')}</dd></div></dl>
      </button>)}</section>}
    </>}

    {route.kind==='capture'&&selectedProgramme&&(()=>{
      const capture=captureDetails.find(item=>item.entry.capture_id===route.captureId);
      if(detailLoading&&!capture)return <section className="panel ariane-empty"><LoaderCircle className="ariane-spin"/><p>Chargement de la captation…</p></section>;
      if(!capture)return <section className="panel ariane-empty"><h2>Captation introuvable</h2></section>;
      return <>
        <section className="panel ariane-data-header"><div><p className="eyebrow">CAPTATION</p><h1>{capture.entry.capture_id}</h1><p>{selectedProgramme.index.programme_id}</p></div><span className="ariane-badge-ok">{capture.metadata.status||(capture.metadata.immutable?'Terminée':'En cours')}</span></section>
        <section className="ariane-detail-kpis">
          <div className="panel"><CalendarDays/><b>{formatDate(captureDate(capture))}</b><span>Date de captation</span></div>
          <div className="panel"><FileText/><b>{capture.sources.length}</b><span>documents</span></div>
          <div className="panel"><Layers3/><b>{capture.candidates.length}</b><span>candidats structure</span></div>
        </section>
        <section className="panel ariane-document-list"><h2>Documents mobilisés</h2>{capture.sources.map(source=><article key={source.source_id}><FileText/><div><b>{source.filename}</b><span>{source.document_type||'Type non renseigné'} · {source.document_date||'date non renseignée'}</span></div><code>{source.source_id}</code></article>)}</section>
      </>;
    })()}

    {route.kind==='structures'&&selectedProgramme&&<>
      <section className="panel ariane-data-header"><div><p className="eyebrow">STRUCTURES VALIDÉES</p><h1>Structures validées</h1><p>{selectedProgramme.index.programme_id}</p></div><span className="ariane-count-pill">{selectedProgramme.index.structures.length}</span></section>
      <section className="ariane-structure-grid">{selectedProgramme.index.structures.map(structure=><button className="panel ariane-structure-card" type="button" key={structure.structure_version} onClick={()=>navigate({kind:'structure',programmeId:selectedProgramme.index.programme_id,structureVersion:structure.structure_version})}>
        <GitBranch/><div><p className="eyebrow">STRUCTURE VALIDÉE</p><h2>{structure.structure_version}</h2><span>{selectedProgramme.index.current.structure_version===structure.structure_version?'Structure CURRENT':'Archive validée'}</span></div><ChevronRight/>
      </button>)}</section>
    </>}

    {route.kind==='structure'&&selectedProgramme&&(()=>{
      if(detailLoading&&!structureDetail)return <section className="panel ariane-empty"><LoaderCircle className="ariane-spin"/><p>Chargement de la structure…</p></section>;
      if(!structureDetail)return <section className="panel ariane-empty"><h2>Structure introuvable</h2></section>;
      const typeCounts=Array.from(structureDetail.structure.objects.reduce((map,object)=>map.set(object.object_type,(map.get(object.object_type)||0)+1),new Map<string,number>()).entries()).sort((a,b)=>b[1]-a[1]);
      const candidates=structureCandidates;
      return <>
        <section className="panel ariane-data-header"><div><p className="eyebrow">STRUCTURE VALIDÉE</p><h1>{structureDetail.entry.structure_version}</h1><p>{selectedProgramme.index.programme_id}</p></div>{selectedProgramme.index.current.structure_version===structureDetail.entry.structure_version&&<span className="ariane-badge-ok">CURRENT</span>}</section>
        <section className="ariane-detail-kpis">
          <div className="panel"><GitBranch/><b>{structureDetail.structure.objects.length}</b><span>objets</span></div>
          <div className="panel"><Layers3/><b>{typeCounts.length}</b><span>types d’objets</span></div>
          <div className="panel"><Boxes/><b>{structureDetail.validation?.applied_changes?.length||0}</b><span>changements appliqués</span></div>
        </section>
        <section className="ariane-structure-detail-grid">
          <article className="panel ariane-validation-summary"><h2>Principales métriques</h2><div className="ariane-type-counts">{typeCounts.map(([type,count])=><span key={type}><b>{type}</b>{count}</span>)}</div></article>
          <button type="button" className="panel ariane-navigation-card ariane-candidate-card" onClick={()=>navigate({kind:'candidates',programmeId:selectedProgramme.index.programme_id,structureVersion:structureDetail.entry.structure_version})}>
            <Layers3/><h2>Candidats structure</h2><p>{candidates.length} objet(s) candidat(s) non intégré(s) disponible(s) à cette version de structure.</p><ChevronRight/>
          </button>
        </section>
        <section className="panel ariane-validation">
          <h2>Décisions et changements</h2>
          {!structureDetail.validation?<p>Aucune trace de validation disponible pour cette structure.</p>:<>
            <div className="ariane-validation-columns">
              <section><h3>Décisions demandées</h3>{(structureDetail.validation.requested_changes||[]).length?<ul>{structureDetail.validation.requested_changes?.map((change,index)=><li key={index}>{change}</li>)}</ul>:<p>Aucune décision demandée.</p>}</section>
              <section><h3>Changements appliqués</h3>{(structureDetail.validation.applied_changes||[]).length?<ul>{structureDetail.validation.applied_changes?.map((change,index)=><li key={index}><code>{String(change.object_id||'')}</code> · {String(change.operation||'')} · {String(change.result||'')}</li>)}</ul>:<p>Aucun changement appliqué.</p>}</section>
            </div>
            {(structureDetail.validation.not_applied_changes?.length||0)>0&&<section className="ariane-validation-warning"><div><h3>Changements non appliqués</h3>{structureDetail.validation.not_applied_changes?.map((change,index)=><p key={index}>{String(change.reason||change.requested_change||'Non appliqué')}</p>)}</div></section>}
          </>}
        </section>
      </>;
    })()}

    {route.kind==='candidates'&&selectedProgramme&&(()=>{
      const candidates=structureCandidates;
      return <>
        <section className="panel ariane-data-header"><div><p className="eyebrow">CANDIDATS STRUCTURE</p><h1>Objets candidats</h1><p>Candidats non intégrés disponibles au moment de {route.structureVersion}.</p></div><span className="ariane-count-pill">{candidates.length}</span></section>
        {detailLoading?<section className="panel ariane-empty"><LoaderCircle className="ariane-spin"/></section>:candidates.length===0?<section className="panel ariane-empty"><Layers3/><h2>Aucun candidat structure</h2><p>Aucun candidat non intégré n’était disponible pour cette version de structure.</p></section>:
        <section className="ariane-candidate-list">{candidates.map(candidate=><article className="panel" key={candidate.object.object_id}><span className="ariane-type-badge">{candidate.object.object_type}</span><div><b>{candidate.object.label||candidate.object.object_id}</b><code>{candidate.object.object_id}</code><small>Détecté dans {candidate.captureIds.join(', ')} · parent {candidate.object.parent_object_id||'non défini'}</small></div></article>)}</section>}
      </>;
    })()}
  </div>;
}
