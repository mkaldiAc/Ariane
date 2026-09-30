import {prompts} from '../content/prompts';

export const normalizeArianeId=(value:string)=>value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .toUpperCase()
  .trim()
  .replace(/[^A-Z0-9]+/g,'_')
  .replace(/^_+|_+$/g,'');

export const buildInitialisationPrompt=({
  programmeId,
  captureId
}:{
  programmeId:string;
  captureId:string;
})=>prompts.initial
  .replaceAll('<PROGRAMME_ID>',programmeId)
  .replaceAll('<CAPTURE_ID_INITIAL>',captureId);
