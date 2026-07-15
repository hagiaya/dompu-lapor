'use client';
import { History, Image as ImageIcon } from 'lucide-react';

export default function RiwayatPetugas() { 
  return (
    <div style={{ padding: '1.25rem' }}>
      <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        <History size={20}/> Riwayat Selesai
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1.25rem', borderLeft: '4px solid var(--success-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>TKT-2024-005</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Kemarin, 14:30</span>
          </div>
          <p style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>Pembersihan Saluran Air Tersumbat</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>Sudah dibersihkan dari sampah plastik dan lumpur. Saluran lancar kembali.</p>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <ImageIcon size={18} color="var(--secondary-color)"/> 2 Foto Terlampir
          </div>
        </div>
      </div>
    </div>
  ); 
}