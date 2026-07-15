import { Map as MapIcon } from 'lucide-react';
import Map from '@/components/Map';
export default function PetaBupati() { return (<div style={{padding: '2rem', height: '100vh', display: 'flex', flexDirection: 'column'}}>
  <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)'}}><MapIcon/> Peta Real-time Area Kabupaten</h1>
  <div className="glass-panel" style={{flex: 1, borderRadius: '1rem', overflow: 'hidden', padding: '0.5rem'}}><Map center={[-8.5333, 118.4667]} zoom={11} /></div>
</div>); }