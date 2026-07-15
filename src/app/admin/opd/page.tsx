'use client';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OPDAdmin() {
  const [opds, setOpds] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOpds() {
      const { data, error } = await supabase.from('opds').select('*').order('created_at', { ascending: true });
      if (data) setOpds(data);
    }
    fetchOpds();
  }, []);

  return (
    <div style={{padding: '2rem'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}><Users/> Manajemen Data OPD</h1>
      <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
        <button className="btn-primary" style={{marginBottom: '1.5rem'}}><Plus size={16}/> Daftarkan OPD Baru</button>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 0' }}>Nama OPD</th>
              <th style={{ padding: '1rem 0' }}>Kepala Dinas</th>
              <th style={{ padding: '1rem 0' }}>Kontak (WhatsApp)</th>
              <th style={{ padding: '1rem 0' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {opds.map((opd, i) => (
            <tr key={opd.id || i} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem 0' }}><strong>{opd.name}</strong></td>
              <td style={{ padding: '1rem 0' }}>{opd.description || 'Dr. Ir. Pejabat Daerah, MT'}</td>
              <td style={{ padding: '1rem 0' }}>08123456789{i}</td>
              <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{padding: '0.5rem', color: 'var(--secondary-color)'}}><Edit size={16}/></button>
                <button className="btn-secondary" style={{padding: '0.5rem', color: 'var(--error-color)'}}><Trash2 size={16}/></button>
              </td>
            </tr>
            ))}
            {opds.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada data OPD.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  ); 
}