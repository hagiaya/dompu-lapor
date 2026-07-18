'use client';
import { Users, Plus, Edit, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OPDAdmin() {
  const [opds, setOpds] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newOpdName, setNewOpdName] = useState('');
  const [newOpdDesc, setNewOpdDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingOpdId, setEditingOpdId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetchOpds();
  }, []);

  async function fetchOpds() {
    const { data, error } = await supabase.from('opds').select('*').order('created_at', { ascending: true });
    if (data) setOpds(data);
  }

  async function handleEditSave(id: string) {
    if (!editName.trim()) return;
    setIsLoading(true);
    const { error } = await supabase.from('opds').update({ name: editName, description: editDesc }).eq('id', id);
    setIsLoading(false);
    if (!error) {
      setEditingOpdId(null);
      fetchOpds();
    } else {
      alert('Gagal mengedit OPD: ' + error.message);
    }
  }

  async function handleAdd() {
    if (!newOpdName.trim()) return;
    setIsLoading(true);
    const { error } = await supabase.from('opds').insert([{ name: newOpdName, description: newOpdDesc }]);
    setIsLoading(false);
    if (!error) {
      setNewOpdName('');
      setNewOpdDesc('');
      setIsAdding(false);
      fetchOpds();
    } else {
      alert('Gagal menambahkan OPD: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus OPD ini?')) {
      const { error } = await supabase.from('opds').delete().eq('id', id);
      if (!error) {
        fetchOpds();
      } else {
        if (error.message.includes('foreign key constraint')) {
          alert('Gagal menghapus: OPD ini tidak bisa dihapus karena masih ada pengguna atau laporan yang terhubung. Hapus data terkait terlebih dahulu.');
        } else {
          alert('Gagal menghapus: ' + error.message);
        }
      }
    }
  }

  return (
    <div style={{padding: '2rem'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}><Users/> Manajemen Data OPD</h1>
      <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
        
        {!isAdding ? (
          <button onClick={() => setIsAdding(true)} className="btn-primary" style={{marginBottom: '1.5rem'}}><Plus size={16}/> Daftarkan OPD Baru</button>
        ) : (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Nama OPD Baru (Cth: Dinas PUPR)" 
              value={newOpdName}
              onChange={(e) => setNewOpdName(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', flex: 1 }}
            />
            <input 
              type="text" 
              placeholder="Nama Kepala Dinas" 
              value={newOpdDesc}
              onChange={(e) => setNewOpdDesc(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', flex: 1 }}
            />
            <button onClick={handleAdd} disabled={isLoading} className="btn-primary">{isLoading ? 'Menyimpan...' : 'Simpan'}</button>
            <button onClick={() => setIsAdding(false)} className="btn-secondary" style={{ padding: '0.5rem' }}><X size={20}/></button>
          </div>
        )}

        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 0' }}>Nama OPD</th>
              <th style={{ padding: '1rem 0' }}>Kepala Dinas</th>
              <th style={{ padding: '1rem 0' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {opds.map((opd, i) => (
            <tr key={opd.id || i} style={{ borderBottom: '1px solid var(--border-color)' }}>
              {editingOpdId === opd.id ? (
                <>
                  <td style={{ padding: '1rem 0', paddingRight: '1rem' }}>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                  </td>
                  <td style={{ padding: '1rem 0', paddingRight: '1rem' }}>
                    <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                  </td>
                  <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEditSave(opd.id)} disabled={isLoading} className="btn-primary" style={{padding: '0.5rem 1rem'}}>{isLoading ? '...' : 'Simpan'}</button>
                    <button onClick={() => setEditingOpdId(null)} className="btn-secondary" style={{padding: '0.5rem 1rem'}}>Batal</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: '1rem 0' }}><strong>{opd.name}</strong></td>
                  <td style={{ padding: '1rem 0' }}>{opd.description || '-'}</td>
                  <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setEditingOpdId(opd.id); setEditName(opd.name); setEditDesc(opd.description || ''); }} className="btn-secondary" style={{padding: '0.5rem', color: 'var(--primary-color)'}}><Edit size={16}/></button>
                    <button onClick={() => handleDelete(opd.id)} className="btn-secondary" style={{padding: '0.5rem', color: 'var(--error-color)'}}><Trash2 size={16}/></button>
                  </td>
                </>
              )}
            </tr>
            ))}
            {opds.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada data OPD.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  ); 
}