import {useState} from 'react';
import {AppShell,type View} from './ui/AppShell';
import {GuideCaptation} from './pages/GuideCaptation';
import {RepositoryDataPage} from './pages/RepositoryDataPage';
import {CurrentDataPage} from './pages/CurrentDataPage';
import {ValidationDataPage} from './pages/ValidationDataPage';

export default function App(){
  const [view,setView]=useState<View>('guide');
  return <AppShell view={view} onNavigate={setView}>
    {view==='guide'&&<GuideCaptation/>}
    {view==='programmes'&&<RepositoryDataPage mode="programmes"/>}
    {view==='captures'&&<RepositoryDataPage mode="captures"/>}
    {view==='structures'&&<CurrentDataPage/>}
    {view==='validations'&&<ValidationDataPage/>}
  </AppShell>;
}
