'use client';
import { UserCheck, CheckCircle2 } from 'lucide-react';

export default function TugasBaruPetugas() { 
  return (
    <div style={{ padding: '1.25rem' }}>
      <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        <UserCheck size={20}/> Tugas Baru (2)
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1,2].map(i => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1.25rem', borderLeft: '4px solid var(--error-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>TKT-2024-00{8+i}</strong>
              <span style={{ color: 'var(--error-color)', fontSize: '0.75rem', fontWeight: 'bold' }}>Baru Saja</span>
            </div>
            <p style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>Lampu Jalan Mati Total di Area Pasar</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>Cek panel listrik utama dan ganti bohlam yang putus secepatnya.</p>
            <button className="btn-primary" style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <CheckCircle2 size={18}/> Terima Tugas
            </button>
          </div>
        ))}
      </div>
    </div>
  ); 
}