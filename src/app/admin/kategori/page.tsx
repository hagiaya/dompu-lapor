'use client';
import { Layers, Plus, Edit, Trash2, X, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function KategoriAdmin() { 
  const [categories, setCategories] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReports = async () => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.from('reports').select(`
        ticket_id, reporter_name, status,
        categories ( name ),
        opds ( name )
      `).order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const headers = ['Nomor Tiket', 'Pelapor', 'Kategori', 'Status', 'OPD Penanganan'];
        const csvRows = [headers.join(',')];
        
        for (const r of data) {
          const row: any = r;
          const values = [
            row.ticket_id,
            `"${row.reporter_name}"`,
            `"${row.categories?.name || '-'}"`,
            row.status,
            `"${row.opds?.name || '-'}"`
          ];
          csvRows.push(values.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Data_Laporan_Keluhan.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Belum ada data laporan untuk diunduh.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengunduh data laporan.');
    }
    setIsDownloading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (data) setCategories(data);
  }

  async function handleAdd() {
    if (!newCategoryName.trim()) return;
    setIsLoading(true);
    const { error } = await supabase.from('categories').insert([{ name: newCategoryName }]);
    setIsLoading(false);
    if (!error) {
      setNewCategoryName('');
      setIsAdding(false);
      fetchCategories();
    } else {
      alert('Gagal menambahkan kategori: ' + error.message);
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    const { error } = await supabase.from('categories').update({ name: editName }).eq('id', id);
    if (!error) {
      setEditingId(null);
      setEditName('');
      fetchCategories();
    } else {
      alert('Gagal memperbarui: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        fetchCategories();
      } else {
        alert('Gagal menghapus: ' + error.message);
      }
    }
  }

  return (
    <div style={{padding: '2rem'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}><Layers/> Kategori Keluhan</h1>
      <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
        
        {!isAdding ? (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => setIsAdding(true)} className="btn-primary"><Plus size={16}/> Tambah Kategori Baru</button>
            <button onClick={handleDownloadReports} disabled={isDownloading} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc' }}>
              <Download size={16}/> {isDownloading ? 'Mengunduh...' : 'Download Data Laporan'}
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Nama Kategori Baru" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', flex: 1 }}
            />
            <button onClick={handleAdd} disabled={isLoading} className="btn-primary">{isLoading ? 'Menyimpan...' : 'Simpan'}</button>
            <button onClick={() => setIsAdding(false)} className="btn-secondary" style={{ padding: '0.5rem' }}><X size={20}/></button>
          </div>
        )}

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
              <td style={{ padding: '1rem 0' }}>
                {editingId === kat.id ? (
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem' }} />
                ) : (
                  <strong>{kat.name}</strong>
                )}
              </td>
              <td style={{ padding: '1rem 0' }}>Keluhan terkait masalah {kat.name.toLowerCase()} publik.</td>
              <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                {editingId === kat.id ? (
                  <>
                    <button onClick={() => handleUpdate(kat.id)} className="btn-primary" style={{padding: '0.5rem'}}>Simpan</button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary" style={{padding: '0.5rem'}}><X size={16}/></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(kat.id); setEditName(kat.name); }} className="btn-secondary" style={{padding: '0.5rem', color: 'var(--primary-color)'}}><Edit size={16}/></button>
                    <button onClick={() => handleDelete(kat.id)} className="btn-secondary" style={{padding: '0.5rem', color: 'var(--error-color)'}}><Trash2 size={16}/></button>
                  </>
                )}
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