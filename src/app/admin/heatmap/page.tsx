'use client';
import { useState } from 'react';
import { Map as MapIcon, Filter } from 'lucide-react';
import Map from '@/components/Map';

export default function HeatmapAdmin() {
  const [filterStatus, setFilterStatus] = useState('ALL');

  return (
    <div style={{ padding: '2rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
          <MapIcon /> Peta Laporan
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <Filter size={18} color="var(--text-secondary)" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <option value="ALL">Semua Laporan</option>
            <option value="RED">🔴 Baru Masuk</option>
            <option value="BLUE">🔵 Sedang Diproses</option>
            <option value="GREEN">🟢 Selesai</option>
          </select>
        </div>
      </div>
      <div className="glass-panel" style={{ flex: 1, borderRadius: '1rem', overflow: 'hidden', padding: '0.5rem' }}>
        <Map center={[-8.5333, 118.4667]} zoom={12} filterStatus={filterStatus} />
      </div>
    </div>
  );
}