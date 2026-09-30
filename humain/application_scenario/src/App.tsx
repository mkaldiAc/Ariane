import {useState} from 'react';
import {AppShell,type View} from './ui/AppShell';
import {GuideCaptation} from './pages/GuideCaptation';
import {ProgrammesPage} from './pages/ProgrammesPage';

export default function App(){
  const [view,setView]=useState<View>('programmes');
  return <AppShell view={view} onNavigate={setView}>
    {view==='programmes'&&<ProgrammesPage/>}
    {view==='guide'&&<GuideCaptation/>}
  </AppShell>;
}
