import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,Check,Clipboard,ExternalLink,GitBranch,GripVertical,LoaderCircle,RotateCcw,X} from 'lucide-react';
import {buildStructureValidationPrompt} from '../execution/promptBuilders';
import {captureDataService,type PatrimonialObject,type ProgrammeData,type StructureCandidate} from '../services/captureDataService';
import {chatLaunchErrorMessage,clipboardErrorMessage,copyPromptAndMaybeOpenChat} from '../utils/promptActions';
import './StructureEvolutionPage.css';

type Props={
  programme:ProgrammeData;
  onBack:()=>void;
  onChatLaunchError:(message:string|null)=>void;
};

type DragPayload={kind:'existing'|'candidate'|'removed';objectId:string};

const nextStructureVersion=(programme:ProgrammeData)=>{
  const numbers=programme.index.structures
    .map(item=>/^STR-(\d+)$/i.exec(item.structure_version)?.[1])
    .filter((value):value is string=>Boolean(value))
    .map(Number);
  const next=(numbers.length?Math.max(...numbers):0)+1;
  return `STR-${String(next).padStart(3,'0')}`;
};

const objectLabel=(object:PatrimonialObject)=>object.label||object.object_id;

const descendantsOf=(objects:PatrimonialObject[],rootId:string)=>{
  const byParent=new Map<string,PatrimonialObject[]>();
  objects.forEach(object=>{
    if(!object.parent_object_id)return;
    const list=byParent.get(object.parent_object_id)||[];
    list.push(object);
    byParent.set(object.parent_object_id,list);
  });
  const ids=new Set<string>([rootId]);
  const visit=(id:string)=>{
    (byParent.get(id)||[]).forEach(child=>{
      if(ids.has(child.object_id))return;
      ids.add(child.object_id);
      visit(child.object_id);
    });
  };
  visit(rootId);
  return ids;
};

const ancestorIds=(objects:PatrimonialObject[],objectId:string)=>{
  const byId=new Map(objects.map(object=>[object.object_id,object]));
  const ids=new Set<string>();
  let current=byId.get(objectId);
  while(current?.parent_object_id){
    const parentId=current.parent_object_id;
    if(ids.has(parentId))break;
    ids.add(parentId);
    current=byId.get(parentId);
  }
  return ids;
};

export function StructureEvolutionPage({programme,onBack,onChatLaunchError}:Props){
  const [currentObjects,setCurrentObjects]=useState<PatrimonialObject[]>([]);
  const [candidates,setCandidates]=useState<StructureCandidate[]>([]);
  const [acceptedCandidateIds,setAcceptedCandidateIds]=useState<Set<string>>(new Set());
  const [removedExistingIds,setRemovedExistingIds]=useState<Set<string>>(new Set());
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [confirmOpen,setConfirmOpen]=useState(false);
  const [clipboardError,setClipboardError]=useState<string|null>(null);
  const [promptCopied,setPromptCopied]=useState(false);

  const sourceStructureVersion=programme.index.current.structure_version;
  const targetStructureVersion=nextStructureVersion(programme);

  useEffect(()=>{
    let active=true;
    setLoading(true);
    setError(null);
    setAcceptedCandidateIds(new Set());
    setRemovedExistingIds(new Set());
    Promise.resolve().then(async()=>{
      const current=await captureDataService.loadCurrent(programme);
      const foundCandidates=await captureDataService.loadCandidatesForStructure(programme,current.structure);
      if(!active)return;
      setCurrentObjects(current.structure.objects);
      setCandidates(foundCandidates);
    }).catch(reason=>{
      if(active)setError(reason instanceof Error?reason.message:String(reason));
    }).finally(()=>{
      if(active)setLoading(false);
    });
    return()=>{active=false};
  },[programme]);

  const candidatesById=useMemo(()=>new Map(candidates.map(candidate=>[candidate.object.object_id,candidate])),[candidates]);
  const currentById=useMemo(()=>new Map(currentObjects.map(object=>[object.object_id,object])),[currentObjects]);

  const targetObjects=useMemo(()=>[
    ...currentObjects.filter(object=>!removedExistingIds.has(object.object_id)),
    ...candidates.filter(candidate=>acceptedCandidateIds.has(candidate.object.object_id)).map(candidate=>candidate.object)
  ],[currentObjects,candidates,removedExistingIds,acceptedCandidateIds]);

  const targetIds=useMemo(()=>new Set(targetObjects.map(object=>object.object_id)),[targetObjects]);

  const orphanTargetObjects=useMemo(
    ()=>targetObjects.filter(object=>object.parent_object_id&&!targetIds.has(object.parent_object_id)),
    [targetObjects,targetIds]
  );

  const availableCandidates=candidates.filter(candidate=>!acceptedCandidateIds.has(candidate.object.object_id));
  const removedExisting=currentObjects.filter(object=>removedExistingIds.has(object.object_id));

  const removeExisting=(objectId:string)=>{
    const cascade=descendantsOf(currentObjects,objectId);
    setRemovedExistingIds(previous=>{
      const next=new Set(previous);
      cascade.forEach(id=>next.add(id));
      return next;
    });
  };

  const restoreExisting=(objectId:string)=>{
    const ancestors=ancestorIds(currentObjects,objectId);
    setRemovedExistingIds(previous=>{
      const next=new Set(previous);
      next.delete(objectId);
      ancestors.forEach(id=>next.delete(id));
      return next;
    });
  };

  const addCandidate=(objectId:string)=>{
    if(!candidatesById.has(objectId))return;
    setAcceptedCandidateIds(previous=>new Set(previous).add(objectId));
  };

  const removeCandidate=(objectId:string)=>{
    setAcceptedCandidateIds(previous=>{
      const next=new Set(previous);
      next.delete(objectId);
      return next;
    });
  };

  const onDrop=(zone:'target'|'available',event:React.DragEvent)=>{
    event.preventDefault();
    try{
      const payload=JSON.parse(event.dataTransfer.getData('application/json')) as DragPayload;
      if(zone==='target'){
        if(payload.kind==='candidate')addCandidate(payload.objectId);
        if(payload.kind==='removed')restoreExisting(payload.objectId);
      }else{
        if(payload.kind==='existing')removeExisting(payload.objectId);
        if(payload.kind==='candidate')removeCandidate(payload.objectId);
      }
    }catch{
      // Ignore malformed drag payloads.
    }
  };

  const dragStart=(event:React.DragEvent,payload:DragPayload)=>{
    event.dataTransfer.effectAllowed='move';
    event.dataTransfer.setData('application/json',JSON.stringify(payload));
  };

  const approvedCandidateIds=Array.from(acceptedCandidateIds);
  const removedIds=Array.from(removedExistingIds);
  const requestedChanges=[
    ...removedIds.map(id=>{
      const object=currentById.get(id);
      return `Retirer de la structure validée l'objet ${id} (${object?.object_type||'TYPE_INCONNU'} — ${object?objectLabel(object):id}).`;
    })
  ];
  const hasChanges=approvedCandidateIds.length>0||removedIds.length>0;
  const canValidate=Boolean(sourceStructureVersion&&hasChanges&&orphanTargetObjects.length===0);

  const buildPrompt=()=>buildStructureValidationPrompt({
    programmeId:programme.index.programme_id,
    sourceStructureVersion:sourceStructureVersion!,
    targetStructureVersion,
    approvedCandidateObjectIds:approvedCandidateIds,
    requestedChanges
  });

  const copyPrompt=async(openChat:boolean)=>{
    if(!canValidate)return;
    setClipboardError(null);
    onChatLaunchError(null);
    try{
      const launch=await copyPromptAndMaybeOpenChat(buildPrompt(),openChat);
      setPromptCopied(true);
      setConfirmOpen(false);
      window.setTimeout(()=>setPromptCopied(false),1600);
      onChatLaunchError(chatLaunchErrorMessage(launch));
    }catch{
      setClipboardError(clipboardErrorMessage());
    }
  };

  if(loading)return <section className="panel ariane-empty"><LoaderCircle className="ariane-spin"/><h1>Évolution de la structure</h1><p>Chargement de la structure CURRENT et des candidats…</p></section>;
  if(error)return <section className="panel ariane-empty"><h2>Impossible de préparer l’évolution</h2><p>{error}</p><button className="button button-action" type="button" onClick={onBack}><ArrowLeft/>Retour</button></section>;
  if(!sourceStructureVersion)return <section className="panel ariane-empty"><h2>Aucune structure validée</h2><p>Une structure CURRENT validée est nécessaire pour lancer ce scénario.</p><button className="button button-action" type="button" onClick={onBack}><ArrowLeft/>Retour</button></section>;

  return <section className="ariane-structure-evolution">
    <header className="panel ariane-data-header ariane-evolution-header">
      <div>
        <h1>Faire évoluer la structure patrimoniale</h1>
        <p>{programme.index.programme_id} · {sourceStructureVersion} → {targetStructureVersion}</p>
      </div>
      <button className="button button-action" type="button" onClick={onBack}><ArrowLeft/>Retour</button>
    </header>

    <div className="ariane-evolution-summary">
      <span><b>{targetObjects.length}</b> objets cible</span>
      <span><b>{approvedCandidateIds.length}</b> candidat(s) ajouté(s)</span>
      <span><b>{removedIds.length}</b> objet(s) retiré(s)</span>
      <button type="button" className="button button-action" disabled={!hasChanges} onClick={()=>{setAcceptedCandidateIds(new Set());setRemovedExistingIds(new Set())}}><RotateCcw/>Réinitialiser</button>
    </div>

    {orphanTargetObjects.length>0&&<div className="ariane-evolution-warning">
      <b>Structure cible incohérente :</b> {orphanTargetObjects.length} objet(s) ont un parent absent de la structure cible. Réintégrez le parent ou retirez l’objet concerné avant validation.
    </div>}

    <div className="ariane-evolution-columns">
      <section className="panel ariane-evolution-zone ariane-evolution-target" onDragOver={event=>event.preventDefault()} onDrop={event=>onDrop('target',event)}>
        <header><div><GitBranch/><div><h2>Structure cible</h2><p>Structure CURRENT conservée + candidats acceptés</p></div></div><span>{targetObjects.length}</span></header>
        <div className="ariane-evolution-list">
          {targetObjects.map(object=>{
            const isCandidate=acceptedCandidateIds.has(object.object_id);
            return <article key={object.object_id} draggable onDragStart={event=>dragStart(event,{kind:isCandidate?'candidate':'existing',objectId:object.object_id})} className={isCandidate?'is-added':''}>
              <GripVertical/>
              <span className="ariane-type-badge">{object.object_type}</span>
              <div><b>{objectLabel(object)}</b><code>{object.object_id}</code><small>Parent : {object.parent_object_id||'racine'}{isCandidate?' · candidat ajouté':''}</small></div>
            </article>;
          })}
        </div>
      </section>

      <section className="panel ariane-evolution-zone ariane-evolution-available" onDragOver={event=>event.preventDefault()} onDrop={event=>onDrop('available',event)}>
        <header><div><GitBranch/><div><h2>Hors structure cible</h2><p>Candidats disponibles et objets explicitement retirés</p></div></div><span>{availableCandidates.length+removedExisting.length}</span></header>
        <div className="ariane-evolution-list">
          {availableCandidates.map(candidate=><article key={candidate.object.object_id} draggable onDragStart={event=>dragStart(event,{kind:'candidate',objectId:candidate.object.object_id})}>
            <GripVertical/>
            <span className="ariane-type-badge">{candidate.object.object_type}</span>
            <div><b>{objectLabel(candidate.object)}</b><code>{candidate.object.object_id}</code><small>Parent : {candidate.object.parent_object_id||'racine'} · détecté dans {candidate.captureIds.join(', ')}</small></div>
          </article>)}
          {removedExisting.map(object=><article key={object.object_id} draggable onDragStart={event=>dragStart(event,{kind:'removed',objectId:object.object_id})} className="is-removed">
            <GripVertical/>
            <span className="ariane-type-badge">{object.object_type}</span>
            <div><b>{objectLabel(object)}</b><code>{object.object_id}</code><small>Retiré de la structure cible · glissez à gauche pour annuler</small></div>
          </article>)}
          {availableCandidates.length===0&&removedExisting.length===0&&<p className="ariane-evolution-empty">Aucun élément hors structure cible.</p>}
        </div>
      </section>
    </div>

    <footer className="panel ariane-evolution-footer">
      <p>Chaque déplacement constitue une décision humaine préparatoire. Le prompt ne sera généré qu’après confirmation explicite.</p>
      <button className="button button-action" type="button" disabled={!canValidate} onClick={()=>setConfirmOpen(true)}><Check/>Valider les changements</button>
    </footer>

    {confirmOpen&&<div className="ariane-evolution-modal-backdrop" role="presentation">
      <section className="panel ariane-evolution-modal" role="dialog" aria-modal="true" aria-labelledby="ariane-evolution-confirm-title">
        <header><div><h2 id="ariane-evolution-confirm-title">Confirmer l’évolution de structure</h2><p>{sourceStructureVersion} → {targetStructureVersion}</p></div><button type="button" className="icon-button" aria-label="Fermer" onClick={()=>setConfirmOpen(false)}><X/></button></header>
        <div className="ariane-evolution-changes">
          <section><h3>Candidats ajoutés ({approvedCandidateIds.length})</h3>{approvedCandidateIds.length?<ul>{approvedCandidateIds.map(id=><li key={id}><code>{id}</code> · {objectLabel(candidatesById.get(id)!.object)}</li>)}</ul>:<p>Aucun candidat ajouté.</p>}</section>
          <section><h3>Objets retirés ({removedIds.length})</h3>{removedIds.length?<ul>{removedIds.map(id=><li key={id}><code>{id}</code> · {objectLabel(currentById.get(id)!)}</li>)}</ul>:<p>Aucun objet retiré.</p>}</section>
        </div>
        {clipboardError&&<p className="ariane-new-programme-warning">{clipboardError}</p>}
        <div className="ariane-evolution-modal-actions">
          <button type="button" className="button button-action" onClick={()=>void copyPrompt(false)}><Clipboard/>{promptCopied?'Prompt copié':'Copier le prompt'}</button>
          <button type="button" className="button button-action" onClick={()=>void copyPrompt(true)}><ExternalLink/>Copier et ouvrir ChatGPT</button>
        </div>
      </section>
    </div>}
  </section>;
}
