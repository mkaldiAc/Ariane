import {config} from '../config';

export type PromptLaunchResult={
  popupBlocked:boolean;
  navigationFailed:boolean;
};

export const writePromptToClipboard=async(text:string)=>{
  if(navigator.clipboard?.writeText){
    try{
      await navigator.clipboard.writeText(text);
      return;
    }catch{
      // Best-effort fallback for browsers refusing the modern Clipboard API.
    }
  }

  const textarea=document.createElement('textarea');
  textarea.value=text;
  textarea.setAttribute('readonly','');
  textarea.style.position='fixed';
  textarea.style.opacity='0';
  textarea.style.pointerEvents='none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied=document.execCommand('copy');
  document.body.removeChild(textarea);
  if(!copied)throw new Error('clipboard-write-failed');
};

export const copyPromptAndMaybeOpenChat=async(text:string,openChat:boolean):Promise<PromptLaunchResult>=>{
  const copyPromise=writePromptToClipboard(text);
  const chatWindow=openChat?window.open('about:blank','_blank'):null;
  const popupBlocked=openChat&&chatWindow===null;

  try{
    await copyPromise;
  }catch(error){
    if(chatWindow&&!chatWindow.closed)chatWindow.close();
    throw error;
  }

  let navigationFailed=false;
  if(chatWindow){
    if(chatWindow.closed){
      navigationFailed=true;
    }else{
      try{
        const targetUrl=new URL(config.chatgptUrl,window.location.href).href;
        chatWindow.opener=null;
        chatWindow.location.replace(targetUrl);
      }catch{
        navigationFailed=true;
        if(!chatWindow.closed)chatWindow.close();
      }
    }
  }

  return {popupBlocked,navigationFailed};
};

export const clipboardErrorMessage=()=>window.isSecureContext
  ?'Chrome n’a pas autorisé la copie. Autorisez l’accès au presse-papiers pour cette application puis réessayez.'
  :'La copie nécessite une connexion HTTPS. Ouvrez l’application via son URL sécurisée puis réessayez.';

export const chatLaunchErrorMessage=(result:PromptLaunchResult)=>{
  if(result.popupBlocked)return 'Le prompt a bien été copié, mais Chrome a bloqué l’ouverture du nouvel onglet ChatGPT.';
  if(result.navigationFailed)return 'Le prompt a bien été copié, mais l’ouverture de ChatGPT n’a pas pu être finalisée.';
  return null;
};
