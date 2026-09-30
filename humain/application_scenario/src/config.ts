export const config={
  uiThemeBaseUrl:import.meta.env.VITE_UI_THEME_BASE_URL||'',
  captureDataBaseUrl:import.meta.env.VITE_CAPTURE_DATA_BASE_URL||'https://raw.githubusercontent.com/mkaldiAc/Ariane_capture_data/main',
  referenceDataBaseUrl:import.meta.env.VITE_ARIANE_REFERENCE_BASE_URL||'https://raw.githubusercontent.com/mkaldiAc/Ariane/main',
  useMockData:import.meta.env.VITE_USE_MOCK_DATA!=='false',
  chatgptUrl:import.meta.env.VITE_CHATGPT_URL||'https://chatgpt.com/',
  azure:{
    clientId:import.meta.env.VITE_AZURE_CLIENT_ID||'',
    tenantId:import.meta.env.VITE_AZURE_TENANT_ID||'',
    redirectUri:import.meta.env.VITE_AZURE_REDIRECT_URI||window.location.origin,
    apiScope:import.meta.env.VITE_API_SCOPE||''
  }
};
export const loadRemoteTheme=(baseUrl:string)=>{if(!baseUrl)return;const base=baseUrl.replace(/\/$/,'');['tokens.css','shell.css','components.css'].forEach(file=>{const link=document.createElement('link');link.rel='stylesheet';link.href=`${base}/theme/${file}`;link.dataset.aiguillonTheme=file;document.head.appendChild(link)})};
