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

const buildStandaloneScenario=(scenarioName:string,scenario:string)=>[
  `ARIANE · SCÉNARIO : ${scenarioName}`,
  prompts.preflight.trim(),
  standaloneTransition,
  scenario.trim()
].join('\n\n---\n\n');

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
