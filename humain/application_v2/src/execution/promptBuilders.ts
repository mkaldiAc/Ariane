import type {StructureChange} from './structureRules';
import {prompts} from '../content/prompts';

export const normalizeArianeId=(value:string)=>value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .toUpperCase()
  .trim()
  .replace(/[^A-Z0-9]+/g,'_')
  .replace(/^_+|_+$/g,'');

const standaloneTransition=`
Le contrôle préalable ci-dessus constitue la première phase de cette même exécution.
S'il réussit, poursuis immédiatement avec le scénario ci-dessous sans attendre de nouveau message utilisateur.
L'interdiction de modifier des fichiers pendant le contrôle préalable cesse uniquement lorsque débute le scénario qui suit.
Si une ressource normative obligatoire ne peut pas être chargée, ou si l'accès nécessaire à la persistance demandée n'est pas disponible, n'exécute aucune écriture et indique précisément le blocage.
`.trim();

const documentRequiredGate=`
CONTRÔLE DOCUMENTAIRE OBLIGATOIRE
Vérifie avant toute autre opération qu'au moins un document exploitable est joint à ce message.
Si aucun document n'est joint, si les pièces jointes sont inaccessibles ou si aucune n'est exploitable, arrête immédiatement ce scénario et indique simplement que le jeu documentaire requis est absent ou inexploitable.
Dans ce cas, ne poursuis pas le chargement du référentiel ARIANE et n'engage aucune autre opération.
Si au moins un document exploitable est présent, poursuis immédiatement.
`.trim();

const buildStandaloneScenario=(scenarioName:string,scenario:string,{documentsRequired=true}:{documentsRequired?:boolean}={})=>[
  `ARIANE · SCÉNARIO : ${scenarioName}`,
  documentsRequired?documentRequiredGate:null,
  prompts.preflight.trim(),
  standaloneTransition,
  scenario.trim()
].filter(Boolean).join('\n\n---\n\n');

export const buildInitialisationPrompt=({
  programmeId,
  captureId
}:{
  programmeId:string;
  captureId:string;
})=>buildStandaloneScenario(
  'INITIALISATION_PROGRAMME',
  prompts.initial
    .replaceAll('<PROGRAMME_ID>',programmeId)
    .replaceAll('<CAPTURE_ID_INITIAL>',captureId)
);


export const buildIncrementalPrompt=({
  programmeId,
  captureId,
  structureVersion
}:{
  programmeId:string;
  captureId:string;
  structureVersion:string;
})=>buildStandaloneScenario(
  'CAPTATION_INCREMENTALE',
  prompts.incremental
    .replaceAll('<PROGRAMME_ID>',programmeId)
    .replaceAll('<CAPTURE_ID_N>',captureId)
    .replaceAll('<STR_COURANTE>',structureVersion)
);


const yamlString=(value:string)=>JSON.stringify(value);

export const buildStructureValidationPrompt=({
  programmeId,
  sourceStructureVersion,
  targetStructureVersion,
  approvedCandidateObjectIds,
  requestedChanges,
  changes=[]
}:{
  programmeId:string;
  sourceStructureVersion:string;
  targetStructureVersion:string;
  approvedCandidateObjectIds:string[];
  requestedChanges:string[];
  changes?:StructureChange[];
})=>{
  const approvedCandidatesBlock=approvedCandidateObjectIds.length
    ?`approved_candidate_object_ids:\n${approvedCandidateObjectIds.map(id=>`  - ${id}`).join('\n')}`
    :'approved_candidate_object_ids: []';
  const requestedChangesBlock=requestedChanges.length
    ?`requested_changes:\n${requestedChanges.map(change=>`  - ${yamlString(change)}`).join('\n')}`
    :'requested_changes: []';

  const changesBlock=changes.length
    ?`changes:\n${changes.map(change=>`  - operation: ${change.operation}\n    object_id: ${yamlString(change.object_id)}${change.from_parent_object_id!==undefined?`\n    from_parent_object_id: ${yamlString(change.from_parent_object_id||'')}`:''}${change.to_parent_object_id!==undefined?`\n    to_parent_object_id: ${yamlString(change.to_parent_object_id||'')}`:''}${change.justification?`\n    justification: ${yamlString(change.justification)}`:''}${change.source_proposal_ids?.length?`\n    source_proposal_ids: [${change.source_proposal_ids.map(yamlString).join(', ')}]`:''}`).join('\n')}`
    :'changes: []';

  const scenario=prompts.validateCandidate
    .replaceAll('<PROGRAMME_ID>',programmeId)
    .replaceAll('<STR_COURANTE>',sourceStructureVersion)
    .replaceAll('<STR_CIBLE>',targetStructureVersion)
    .replace(
      /approved_candidate_object_ids:\n\s*- <OBJECT_ID_CANDIDAT>/,
      approvedCandidatesBlock
    )
    .replace(
      /requested_changes:\n\s*- "<CORRECTION_EXPLICITEMENT_VALIDEE_PAR_L_HUMAIN>"/,
      requestedChangesBlock
    ).replace('changes: []',changesBlock);

  return buildStandaloneScenario(
    'VALIDER_STRUCTURE',
    scenario,
    {documentsRequired:false}
  );
};
