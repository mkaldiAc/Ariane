import {useEffect,useMemo,useState,type DragEvent} from 'react';
import {AlertTriangle,ArchiveRestore,ArrowLeft,ArrowRight,Check,Clipboard,ExternalLink,GitBranch,GripVertical,LoaderCircle,Move,RotateCcw,X} from 'lucide-react';
import {buildStructureValidationPrompt} from '../execution/promptBuilders';
import {allowedParentTypes,buildValidatedChanges,canReparent,parentNeedsPhysicalVerification,validateStructure,type StructureChange} from '../execution/structureRules';
import {captureDataService,type HistoricalObject,type PatrimonialObject,type ProgrammeData,type StructureCandidate,type StructureProposal} from '../services/captureDataService';
import {chatLaunchErrorMessage,clipboardErrorMessage,copyPromptAndMaybeOpenChat} from '../utils/promptActions';
import './StructureEvolutionPage.css';

type Props={
  programme:ProgrammeData;
  onBack:()=>void;
  onChatLaunchError:(message:string|null)=>void;
};

type DragPayload={kind:'existing'|'candidate'|'removed'|'historical';objectId:string};

const nextStructureVersion=(programme:ProgrammeData)=>{
  const numbers=programme.index.structures
    .map(item=>/^STR-(\d+)$/i.exec(item.structure_version)?.[1])
    .filter((value):value is string=>Boolean(value))
    .map(Number);
  const next=(numbers.length?Math.max(...numbers):0)+1;
  return `STR-${String(next).padStart(3,'0')}`;
};

const objectLabel=(object:PatrimonialObject)=>object.label||object.object_id;

export function StructureEvolutionPage({programme,onBack,onChatLaunchError}:Props){
  const [currentObjects,setCurrentObjects]=useState<PatrimonialObject[]>([]);
  const [candidates,setCandidates]=useState<StructureCandidate[]>([]);
  const [historicalObjects,setHistoricalObjects]=useState<HistoricalObject[]>([]);
  const [proposals,setProposals]=useState<StructureProposal[]>([]);
  const [reintegratedIds,setReintegratedIds]=useState<Set<string>>(new Set());
  const [parentOverrides,setParentOverrides]=useState<Record<string,string>>({});
  const [moveObjectId,setMoveObjectId]=useState<string|null>(null);
  const [qualifiedObjectId,setQualifiedObjectId]=useState('');
  const [qualifiedProposalId,setQualifiedProposalId]=useState('');
  const [humanJustification,setHumanJustification]=useState('');
  const [physicalVerified,setPhysicalVerified]=useState(false);
  const [humanApproved,setHumanApproved]=useState(false);
  const [editError,setEditError]=useState<string|null>(null);
  const [approvedProposalByObject,setApprovedProposalByObject]=useState<Record<string,string>>({});
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
    setReintegratedIds(new Set());
    setParentOverrides({});
    setHumanApproved(false);
    setPhysicalVerified(false);
    setEditError(null);
    Promise.resolve().then(async()=>{
      const current=await captureDataService.loadCurrent(programme);
      const [foundCandidates,historical,foundProposals]=await Promise.all([
        captureDataService.loadCandidatesForStructure(programme,current.structure),
        captureDataService.loadHistoricalObjects(programme,current.structure),
        captureDataService.loadStructureProposals(programme)
      ]);
      if(!active)return;
      setCurrentObjects(current.structure.objects);
      setCandidates(foundCandidates);
      setHistoricalObjects(historical);
      setProposals(foundProposals);
    }).catch(reason=>{
      if(active)setError(reason instanceof Error?reason.message:String(reason));
    }).finally(()=>{
      if(active)setLoading(false);
    });
    return()=>{active=false};
  },[programme]);

  const candidatesById=useMemo(()=>new Map(candidates.map(candidate=>[candidate.object.object_id,candidate])),[candidates]);
  const currentById=useMemo(()=>new Map(currentObjects.map(object=>[object.object_id,object])),[currentObjects]);
  const historicalById=useMemo(()=>new Map(historicalObjects.map(item=>[item.object.object_id,item])),[historicalObjects]);

  const targetObjects=useMemo(()=>[
    ...currentObjects.filter(object=>!removedExistingIds.has(object.object_id)),
    ...candidates.filter(candidate=>acceptedCandidateIds.has(candidate.object.object_id)).map(candidate=>candidate.object),
    ...historicalObjects.filter(item=>reintegratedIds.has(item.object.object_id)).map(item=>item.object)
  ].map(object=>parentOverrides[object.object_id]
    ?{...object,parent_object_id:parentOverrides[object.object_id]}
    :object),[currentObjects,candidates,historicalObjects,removedExistingIds,acceptedCandidateIds,reintegratedIds,parentOverrides]);

  const targetIds=useMemo(()=>new Set(targetObjects.map(object=>object.object_id)),[targetObjects]);

  const orderedTargetObjects=useMemo(()=>{
    const byParent=new Map<string|null,PatrimonialObject[]>();
    targetObjects.forEach(object=>{
      const parent=object.parent_object_id&&targetObjects.some(item=>item.object_id===object.parent_object_id)
        ?object.parent_object_id
        :null;
      const list=byParent.get(parent)||[];
      list.push(object);
      byParent.set(parent,list);
    });
    byParent.forEach(list=>list.sort((a,b)=>objectLabel(a).localeCompare(objectLabel(b),'fr',{numeric:true})));
    const ordered:Array<{object:PatrimonialObject;depth:number}>=[];
    const visit=(parent:string|null,depth:number)=>{
      (byParent.get(parent)||[]).forEach(object=>{
        ordered.push({object,depth});
        visit(object.object_id,depth+1);
      });
    };
    visit(null,0);
    return ordered;
  },[targetObjects]);


  const structureIssues=useMemo(()=>validateStructure(targetObjects),[targetObjects]);
  const availableCandidates=candidates.filter(candidate=>!acceptedCandidateIds.has(candidate.object.object_id));
  const removedExisting=currentObjects.filter(object=>removedExistingIds.has(object.object_id));
  const archivedAvailable=historicalObjects.filter(item=>!reintegratedIds.has(item.object.object_id));
  const reinserted=historicalObjects.filter(item=>reintegratedIds.has(item.object.object_id));
  const changedParents=targetObjects.filter(object=>parentOverrides[object.object_id]
    &&parentOverrides[object.object_id]!==(
      currentById.get(object.object_id)||candidatesById.get(object.object_id)?.object||historicalById.get(object.object_id)?.object
    )?.parent_object_id);
  const hasParentChanges=changedParents.length>0;

  const removeExisting=(objectId:string,proposalId?:string)=>{
    const object=currentById.get(objectId);
    if(!object||object.object_type==='PRG'){
      setEditError('La racine PRG ne peut pas être retirée.');
      return;
    }
    const directChildren=targetObjects.filter(item=>item.parent_object_id===objectId);
    if(directChildren.length){
      setEditError('Retrait bloqué : déplacez ou retirez explicitement les '+directChildren.length+' enfant(s) avant de retirer '+objectId+'. Aucune cascade automatique.');
      return;
    }
    setRemovedExistingIds(previous=>new Set(previous).add(objectId));
    if(proposalId)setApprovedProposalByObject(previous=>({...previous,[objectId]:proposalId}));
    setEditError(null);
  };

  const restoreExisting=(objectId:string)=>{
    setRemovedExistingIds(previous=>{const next=new Set(previous);next.delete(objectId);return next});
    setEditError(null);
  };
  const reintegrateHistorical=(objectId:string)=>{
    if(!historicalById.has(objectId))return;
    setReintegratedIds(previous=>new Set(previous).add(objectId));
    setEditError(null);
  };
  const removeHistorical=(objectId:string)=>{
    setReintegratedIds(previous=>{const next=new Set(previous);next.delete(objectId);return next});
    setParentOverrides(previous=>{const next={...previous};delete next[objectId];return next});
  };
  const updateParent=(objectId:string,parentId:string,proposalId?:string)=>{
    const object=targetObjects.find(item=>item.object_id===objectId);
    const parent=targetObjects.find(item=>item.object_id===parentId);
    if(!object||!parent)return setEditError('Le déplacement requiert deux objets présents dans la structure cible.');
    const issues=canReparent(targetObjects,objectId,parentId);
    if(issues.length)return setEditError('Déplacement interdit : '+issues[0].message);
    setParentOverrides(previous=>({...previous,[objectId]:parentId}));
    setMoveObjectId(null);
    setPhysicalVerified(false);
    if(proposalId)setApprovedProposalByObject(previous=>({...previous,[objectId]:proposalId}));
    setEditError(null);
  };

  const addCandidate=(objectId:string)=>{
    if(!candidatesById.has(objectId))return;
    setAcceptedCandidateIds(previous=>new Set(previous).add(objectId));
  };

  const removeCandidate=(objectId:string)=>{
    setParentOverrides(previous=>{const next={...previous};delete next[objectId];return next});
    setAcceptedCandidateIds(previous=>{
      const next=new Set(previous);
      next.delete(objectId);
      return next;
    });
  };

  const onDrop=(zone:'target'|'available',event:DragEvent,parentId?:string)=>{
    event.preventDefault();
    try{
      const payload=JSON.parse(event.dataTransfer.getData('application/json')) as DragPayload;
      if(zone==='target'){
        if(parentId){
          updateParent(payload.objectId,parentId);
        }else{
          if(payload.kind==='candidate')addCandidate(payload.objectId);
          if(payload.kind==='removed')restoreExisting(payload.objectId);
          if(payload.kind==='historical')reintegrateHistorical(payload.objectId);
        }
      }else{
        if(payload.kind==='existing')removeExisting(payload.objectId);
        if(payload.kind==='candidate')removeCandidate(payload.objectId);
        if(payload.kind==='historical')removeHistorical(payload.objectId);
      }
    }catch{
      // Ignore malformed drag payloads.
    }
  };

  const dragStart=(event:DragEvent,payload:DragPayload)=>{
    event.dataTransfer.effectAllowed='move';
    event.dataTransfer.setData('application/json',JSON.stringify(payload));
  };

  const approvedCandidateIds=Array.from(acceptedCandidateIds);
  const removedIds=Array.from(removedExistingIds);
  const reinsertedIds=Array.from(reintegratedIds);
  const changes:StructureChange[]=[
    ...approvedCandidateIds.map(id=>({
      operation:'AJOUT' as const,object_id:id,
      source_proposal_ids:approvedProposalByObject[id]?[approvedProposalByObject[id]]:undefined
    })),
    ...removedIds.map(id=>({
      operation:'RETRAIT' as const,object_id:id,
      justification:humanJustification.trim()||'Retrait explicitement arbitré par l’humain',
      source_proposal_ids:approvedProposalByObject[id]?[approvedProposalByObject[id]]:undefined
    })),
    ...reinsertedIds.map(id=>({
      operation:'REINTEGRATION' as const,object_id:id,
      to_parent_object_id:targetObjects.find(object=>object.object_id===id)?.parent_object_id||null
    })),
    ...changedParents.map(object=>({
      operation:'MODIFIER_PARENT' as const,object_id:object.object_id,
      from_parent_object_id:(
        currentById.get(object.object_id)||candidatesById.get(object.object_id)?.object||historicalById.get(object.object_id)?.object
      )?.parent_object_id||null,
      to_parent_object_id:object.parent_object_id||null,
      justification:humanJustification.trim(),
      source_proposal_ids:approvedProposalByObject[object.object_id]?[approvedProposalByObject[object.object_id]]:undefined
    }))
  ];
  const requestedChanges:string[]=[]; // Les changements exécutables sont exclusivement structurés.
  const hasChanges=changes.length>0;
  const physicalWarnings=changedParents.filter(object=>
    parentNeedsPhysicalVerification(object.object_type,targetObjects.find(x=>x.object_id===object.parent_object_id)?.object_type||'')
  );
  const canValidate=Boolean(sourceStructureVersion&&hasChanges&&structureIssues.length===0
    &&(!hasParentChanges||(physicalVerified&&humanJustification.trim().length>=12))
    &&(!removedIds.length||humanJustification.trim().length>=12));

  const buildPrompt=()=>buildStructureValidationPrompt({
    programmeId:programme.index.programme_id,
    sourceStructureVersion:sourceStructureVersion!,
    targetStructureVersion,
    approvedCandidateObjectIds:approvedCandidateIds,
    requestedChanges,
    changes:buildValidatedChanges(humanApproved,changes)
  });

  const copyPrompt=async(openChat:boolean)=>{
    if(!canValidate||!humanApproved)return;
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
      <span><b>{reinsertedIds.length}</b> objet(s) réintégré(s)</span>
      <span><b>{changedParents.length}</b> parent(s) modifié(s)</span>
      <button type="button" className="button button-action" disabled={!hasChanges} onClick={()=>{
        setAcceptedCandidateIds(new Set());setRemovedExistingIds(new Set());
        setReintegratedIds(new Set());setParentOverrides({});setPhysicalVerified(false);
        setHumanJustification('');setEditError(null);setApprovedProposalByObject({});
      }}><RotateCcw/>Réinitialiser</button>
    </div>

    {editError&&<div className="ariane-evolution-warning" role="alert"><AlertTriangle/> {editError}</div>}
    {structureIssues.length>0&&<div className="ariane-evolution-warning" role="alert">
      <b>Validation bloquée : {structureIssues.length} erreur(s) de structure</b>
      <ul>{structureIssues.slice(0,12).map((issue,index)=><li key={index}><code>{issue.objectId}</code> : {issue.message}</li>)}</ul>
    </div>}

    <div className="ariane-evolution-columns">
      <section className="panel ariane-evolution-zone ariane-evolution-target" onDragOver={event=>event.preventDefault()} onDrop={event=>onDrop('target',event)}>
        <header><div><GitBranch/><div><h2>Structure cible</h2><p>Structure CURRENT conservée + candidats acceptés</p></div></div><span>{targetObjects.length}</span></header>
        <div className="ariane-evolution-list">
          {orderedTargetObjects.map(({object,depth})=>{
            const isCandidate=acceptedCandidateIds.has(object.object_id);
            const isReintegrated=reintegratedIds.has(object.object_id);
            const editable=moveObjectId===object.object_id;
            const parents=targetObjects.filter(parent=>
              parent.object_id!==object.object_id&&allowedParentTypes(object.object_type).includes(parent.object_type)
              &&canReparent(targetObjects,object.object_id,parent.object_id).length===0
            );
            return <article key={object.object_id} style={{marginLeft:`${Math.min(depth,8)*14}px`}}
              draggable onDragStart={event=>dragStart(event,{kind:isCandidate?'candidate':isReintegrated?'historical':'existing',objectId:object.object_id})}
              onDragOver={event=>{event.preventDefault();event.stopPropagation()}}
              onDrop={event=>{event.stopPropagation();onDrop('target',event,object.object_id)}}
              className={isCandidate?'is-added':isReintegrated?'is-reintegrated':parentOverrides[object.object_id]?'is-moved':''}>
              <GripVertical/>
              <span className="ariane-type-badge">{object.object_type}</span>
              <div>
                <b>{objectLabel(object)}</b><code>{object.object_id}</code>
                <small>Parent : {object.parent_object_id||'racine'}{isCandidate?' · ajout':isReintegrated?' · réintégration':parentOverrides[object.object_id]?' · parent modifié':''}</small>
                {editable&&<label className="ariane-parent-picker">Nouveau parent :
                  <select value={object.parent_object_id||''} onChange={event=>updateParent(object.object_id,event.target.value)}>
                    <option value="" disabled>Choisir un parent valide</option>
                    {parents.map(parent=><option key={parent.object_id} value={parent.object_id}>{parent.object_type} · {objectLabel(parent)} ({parent.object_id})</option>)}
                  </select>
                </label>}
              </div>
              {object.object_type!=='PRG'&&<button type="button" className="ariane-evolution-item-action" title="Changer le parent de cet objet" aria-label={'Changer le parent de '+object.object_id} onClick={()=>setMoveObjectId(editable?null:object.object_id)}><Move/></button>}
              <button type="button" className="ariane-evolution-item-action" aria-label={isCandidate?'Annuler cet ajout':isReintegrated?'Annuler cette réintégration':'Proposer un retrait explicite'} onClick={()=>isCandidate?removeCandidate(object.object_id):isReintegrated?removeHistorical(object.object_id):removeExisting(object.object_id)}><ArrowRight/></button>
            </article>;
          })}
        </div>
      </section>

      <section className="panel ariane-evolution-zone ariane-evolution-available" onDragOver={event=>event.preventDefault()} onDrop={event=>onDrop('available',event)}>
        <header><div><GitBranch/><div><h2>Propositions et archives</h2><p>Ajouts · retraits · réintégrations · écarts documentaires</p></div></div><span>{availableCandidates.length+removedExisting.length+archivedAvailable.length+proposals.length}</span></header>
        <div className="ariane-evolution-list">
          {proposals.length>0&&<div className="ariane-evolution-proposals">
            <h3>Propositions issues des captations ({proposals.length})</h3>
            {proposals.map(proposal=>{
              const target=proposal.object_id?targetObjects.find(object=>object.object_id===proposal.object_id):undefined;
              const archived=proposal.object_id?historicalById.get(proposal.object_id):undefined;
              const candidate=proposal.object_id?candidatesById.get(proposal.object_id):undefined;
              const canRemove=proposal.operation==='RETRAIT'&&target&&proposal.qualification_status==='IDENTIFIEE';
              return <div key={proposal.proposal_id} className="ariane-evolution-proposal">
                <b>{proposal.operation} · {proposal.qualification_status==='A_QUALIFIER'?'À qualifier':'Objet identifié'}</b>
                <small>{proposal.capture_id}{proposal.legacy?' · Anomalie historique interprétée, non validée':''}</small>
                <p>{proposal.description}</p>
                {proposal.object_id&&<code>{proposal.object_id}</code>}
                <div className="ariane-evolution-proposal-actions">
                  {canRemove&&<button type="button" className="button" onClick={()=>removeExisting(proposal.object_id!,proposal.proposal_id)}>Proposer le retrait</button>}
                  {proposal.operation==='AJOUT'&&candidate&&<button className="button" type="button" onClick={()=>addCandidate(candidate.object.object_id)}>Ajouter le candidat</button>}
                  {proposal.operation==='REINTEGRATION'&&archived&&<button className="button" type="button" onClick={()=>reintegrateHistorical(archived.object.object_id)}>Réintégrer</button>}
                  {proposal.operation==='MODIFIER_PARENT'&&target&&proposal.to_parent_object_id&&<button className="button" type="button" onClick={()=>updateParent(target.object_id,proposal.to_parent_object_id!,proposal.proposal_id)}>Appliquer le rattachement proposé</button>}
                  {proposal.operation==='RETRAIT'&&proposal.qualification_status==='A_QUALIFIER'&&<button className="button" type="button" onClick={()=>{
                    setQualifiedProposalId(qualifiedProposalId===proposal.proposal_id?'':proposal.proposal_id);
                    setQualifiedObjectId('');
                  }}>Qualifier manuellement</button>}
                </div>
                {qualifiedProposalId===proposal.proposal_id&&<div className="ariane-qualify">
                  <label>Objet à retirer, identifié par l'humain
                    <select value={qualifiedObjectId} onChange={event=>setQualifiedObjectId(event.target.value)}>
                      <option value="">Sélectionner l'objet exact</option>
                      {targetObjects.filter(o=>o.object_type!=='PRG').map(object=><option key={object.object_id} value={object.object_id}>{object.object_type} · {objectLabel(object)} ({object.object_id})</option>)}
                    </select>
                  </label>
                  <button type="button" className="button" disabled={!qualifiedObjectId} onClick={()=>{
                    removeExisting(qualifiedObjectId,proposal.proposal_id);
                    setQualifiedProposalId('');
                  }}>Retenir cet objet pour retrait</button>
                </div>}
              </div>;
            })}
          </div>}
          <h3 className="ariane-zone-subtitle">Nouveaux objets candidats ({availableCandidates.length})</h3>
          {availableCandidates.map(candidate=><article key={candidate.object.object_id} draggable onDragStart={event=>dragStart(event,{kind:'candidate',objectId:candidate.object.object_id})}>
            <GripVertical/>
            <span className="ariane-type-badge">{candidate.object.object_type}</span>
            <div><b>{objectLabel(candidate.object)}</b><code>{candidate.object.object_id}</code><small>Parent : {candidate.object.parent_object_id||'racine'} · détecté dans {candidate.captureIds.join(', ')}</small></div>
            <button type="button" className="ariane-evolution-item-action" aria-label="Ajouter ce candidat à la structure cible" onClick={()=>addCandidate(candidate.object.object_id)}><ArrowLeft/></button>
          </article>)}
          <h3 className="ariane-zone-subtitle">Objets retirés de la structure cible ({removedExisting.length})</h3>
          {removedExisting.map(object=><article key={object.object_id} draggable onDragStart={event=>dragStart(event,{kind:'removed',objectId:object.object_id})} className="is-removed">
            <GripVertical/>
            <span className="ariane-type-badge">{object.object_type}</span>
            <div><b>{objectLabel(object)}</b><code>{object.object_id}</code><small>Retiré de la structure cible · glissez à gauche pour annuler</small></div>
            <button type="button" className="ariane-evolution-item-action" aria-label="Réintégrer cet objet à la structure cible" onClick={()=>restoreExisting(object.object_id)}><ArrowLeft/></button>
          </article>)}
          <h3 className="ariane-zone-subtitle">Objets archivés réintégrables ({archivedAvailable.length})</h3>
          {archivedAvailable.map(item=><article key={item.object.object_id} className="is-archived" draggable onDragStart={event=>dragStart(event,{kind:'historical',objectId:item.object.object_id})}>
            <ArchiveRestore/><span className="ariane-type-badge">{item.object.object_type}</span>
            <div><b>{objectLabel(item.object)}</b><code>{item.object.object_id}</code><small>Présent dans : {item.structureVersions.join(', ')}</small></div>
            <button type="button" className="ariane-evolution-item-action" aria-label={'Réintégrer '+item.object.object_id} onClick={()=>reintegrateHistorical(item.object.object_id)}><ArrowLeft/></button>
          </article>)}
          {availableCandidates.length===0&&removedExisting.length===0&&archivedAvailable.length===0&&proposals.length===0&&<p className="ariane-evolution-empty">Aucun élément hors structure cible.</p>}
        </div>
      </section>
    </div>

    <section className="panel ariane-evolution-evidence">
      <h2>Justification de l'arbitrage humain</h2>
      <p>Obligatoire pour retirer ou déplacer un objet. Précisez la preuve physique et les identifiants concernés : aucun retrait ne découle automatiquement d'une anomalie.</p>
      <textarea value={humanJustification} onChange={event=>setHumanJustification(event.target.value)} rows={3} placeholder="Document ou constat métier justifiant la sélection précise, le retrait ou le nouveau parent…" />
      {hasParentChanges&&<label className="ariane-evolution-physical">
        <input type="checkbox" checked={physicalVerified} onChange={event=>setPhysicalVerified(event.target.checked)}/>
        J'ai vérifié la réalité physique du rattachement et la priorité obligatoire des CIR directement desservantes.
      </label>}
      {physicalWarnings.length>0&&<p className="ariane-evolution-warning">{physicalWarnings.length} objet(s) ont un parent qui n'est pas une CIR. Vérifiez qu'aucune circulation intérieure directement desservante n'est démontrable.</p>}
    </section>
    <footer className="panel ariane-evolution-footer">
      <p>Les mouvements sont des décisions préparatoires. La structure reste inchangée jusqu'à confirmation explicite, puis exécution contrôlée du prompt.</p>
      <button className="button button-action" type="button" disabled={!canValidate} onClick={()=>{setHumanApproved(false);setConfirmOpen(true)}}><Check/>Valider les changements</button>
    </footer>

    {confirmOpen&&<div className="ariane-evolution-modal-backdrop" role="presentation">
      <section className="panel ariane-evolution-modal" role="dialog" aria-modal="true" aria-labelledby="ariane-evolution-confirm-title">
        <header><div><h2 id="ariane-evolution-confirm-title">Confirmer l’évolution de structure</h2><p>{sourceStructureVersion} → {targetStructureVersion}</p></div><button type="button" className="icon-button" aria-label="Fermer" onClick={()=>setConfirmOpen(false)}><X/></button></header>
        <div className="ariane-evolution-changes">
          <section><h3>Candidats ajoutés ({approvedCandidateIds.length})</h3>{approvedCandidateIds.length?<ul>{approvedCandidateIds.map(id=><li key={id}><code>{id}</code> · {objectLabel(candidatesById.get(id)!.object)}</li>)}</ul>:<p>Aucun candidat ajouté.</p>}</section>
          <section><h3>Objets retirés ({removedIds.length})</h3>{removedIds.length?<ul>{removedIds.map(id=><li key={id}><code>{id}</code> · {objectLabel(currentById.get(id)!)}</li>)}</ul>:<p>Aucun objet retiré.</p>}</section>
          <section><h3>Objets réintégrés ({reinsertedIds.length})</h3>{reinsertedIds.length?<ul>{reinsertedIds.map(id=><li key={id}><code>{id}</code></li>)}</ul>:<p>Aucune réintégration.</p>}</section>
          <section><h3>Rattachements modifiés ({changedParents.length})</h3>{changedParents.length?<ul>{changedParents.map(o=><li key={o.object_id}><code>{o.object_id}</code> → <code>{o.parent_object_id}</code></li>)}</ul>:<p>Aucun déplacement.</p>}</section>
        </div>
        <label className="ariane-evolution-approval">
          <input type="checkbox" checked={humanApproved} onChange={event=>setHumanApproved(event.target.checked)}/>
          Je confirme explicitement, en tant qu'humain, l'ensemble des {changes.length} changement(s) décrits ci-dessus. Je comprends qu'aucun changement n'est validé par l'IA de sa propre initiative.
        </label>
        {clipboardError&&<p className="ariane-new-programme-warning">{clipboardError}</p>}
        <div className="ariane-evolution-modal-actions">
          <button type="button" className="button button-action" disabled={!humanApproved} onClick={()=>void copyPrompt(false)}><Clipboard/>{promptCopied?'Prompt copié':'Copier le prompt'}</button>
          <button type="button" className="button button-action" disabled={!humanApproved} onClick={()=>void copyPrompt(true)}><ExternalLink/>Copier et ouvrir ChatGPT</button>
        </div>
      </section>
    </div>}
  </section>;
}
