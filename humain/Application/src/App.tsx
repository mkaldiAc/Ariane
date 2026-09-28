import {useState} from 'react';
import {AppShell,type View} from './ui/AppShell';
import {GuideCaptation} from './pages/GuideCaptation';
import {RepositoryDataPage} from './pages/RepositoryDataPage';

export default function App(){
  const [view,setView]=useState<View>('guide');
  return <AppShell view={view} onNavigate={setView}>
    {view==='guide'?<GuideCaptation/>:<RepositoryDataPage mode={view}/>}
  </AppShell>;
}
