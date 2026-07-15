'use client';
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function KategoriAdmin() { 
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  return (
    <div style={{padding: '2rem'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}><Layers/> Kategori Keluhan</h1>
      <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
        <button className="btn-primary" style={{marginBottom: '1.5rem'}}><Plus size={16}/> Tambah Kategori Baru</button>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 0' }}>Nama Kategori</th>
              <th style={{ padding: '1rem 0' }}>Deskripsi</th>
              <th style={{ padding: '1rem 0' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((kat, i) => (
            <tr key={kat.id || i} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem 0' }}><strong>{kat.name}</strong></td>
              <td style={{ padding: '1rem 0' }}>Keluhan terkait masalah {kat.name.toLowerCase()} publik.</td>
              <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{padding: '0.5rem', color: 'var(--secondary-color)'}}><Edit size={16}/></button>
                <button className="btn-secondary" style={{padding: '0.5rem', color: 'var(--error-color)'}}><Trash2 size={16}/></button>
              </td>
            </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada data kategori.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  ); 
}