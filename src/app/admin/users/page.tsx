'use client';
import { Users, Plus, X, User, Shield, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function UsersAdmin() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [opds, setOpds] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'OPD',
    opd_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: 'OPD',
    opd_id: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchOpds();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*, opds(name)')
      .order('created_at', { ascending: false });
    if (data) setUsersList(data);
  }

  async function fetchOpds() {
    const { data } = await supabase.from('opds').select('*').order('name');
    if (data) setOpds(data);
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Gagal membuat akun.');
      }
      
      setSuccessMsg(`Akun ${formData.name} berhasil dibuat!`);
      setFormData({ name: '', email: '', password: '', role: 'OPD', opd_id: '' });
      setIsAdding(false);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal memperbarui akun.');
      
      setSuccessMsg('Akun berhasil diperbarui!');
      setEditingUserId(null);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus akun ini?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menghapus akun.');
      
      setSuccessMsg('Akun berhasil dihapus!');
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <User size={28} color="var(--secondary-color)" /> Manajemen Akun Pegawai
        </h1>
        <button onClick={() => setIsAdding(true)} className="btn-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Daftarkan Akun Baru
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
          {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #fca5a5' }}>
          {errorMsg}
        </div>
      )}

      {isAdding && (
        <div style={{ padding: '2rem', background: 'white', borderRadius: '1.25rem', border: '1px solid var(--border-color)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Formulir Pembuatan Akun</h3>
            <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20}/></button>
          </div>
          
          <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            <div className="form-group">
              <label className="form-label">Tipe Akun (Role)</label>
              <select className="form-input" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="OPD">Kepala / Dinas OPD</option>
                <option value="EMPLOYEE">Petugas Lapangan (Employee)</option>
                <option value="ADMIN">Super Admin</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Tautkan ke OPD</label>
              <select className="form-input" value={formData.opd_id} onChange={e => setFormData({...formData, opd_id: e.target.value})} disabled={formData.role === 'ADMIN'}>
                <option value="">-- Tidak ditautkan --</option>
                {opds.map(opd => (
                  <option key={opd.id} value={opd.id}>{opd.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nama Lengkap</label>
              <input type="text" className="form-input" placeholder="Cth: Ir. Soekarno" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Email Login</label>
              <input type="email" className="form-input" placeholder="pegawai@dompu.go.id" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Kata Sandi</label>
              <input type="password" className="form-input" placeholder="Min. 6 karakter" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '0.5rem' }}>
                {loading ? 'Memproses...' : 'Buat Akun'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1.5rem', fontWeight: 'bold' }}>Nama Pengguna</th>
              <th style={{ padding: '1.5rem', fontWeight: 'bold' }}>Peran (Role)</th>
              <th style={{ padding: '1.5rem', fontWeight: 'bold' }}>Instansi (OPD)</th>
              <th style={{ padding: '1.5rem', fontWeight: 'bold' }}>Terdaftar</th>
              <th style={{ padding: '1.5rem', fontWeight: 'bold' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                <td style={{ padding: '1.5rem' }}>
                  {editingUserId === user.id ? (
                    <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="form-input" style={{ padding: '0.25rem', marginBottom: '0.25rem' }} />
                  ) : (
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{user.name}</div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {user.id.substring(0,8)}...</div>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  {editingUserId === user.id ? (
                    <select value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})} className="form-input" style={{ padding: '0.25rem' }}>
                      <option value="OPD">Kepala / Dinas OPD</option>
                      <option value="EMPLOYEE">Petugas Lapangan (Employee)</option>
                      <option value="ADMIN">Super Admin</option>
                    </select>
                  ) : (
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      background: user.role === 'ADMIN' ? '#fee2e2' : user.role === 'BUPATI' ? '#fef3c7' : '#e0e7ff',
                      color: user.role === 'ADMIN' ? '#991b1b' : user.role === 'BUPATI' ? '#92400e' : '#3730a3'
                    }}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
                  {editingUserId === user.id ? (
                    <select value={editFormData.opd_id} onChange={e => setEditFormData({...editFormData, opd_id: e.target.value})} disabled={editFormData.role === 'ADMIN'} className="form-input" style={{ padding: '0.25rem' }}>
                      <option value="">-- Tidak ditautkan --</option>
                      {opds.map(opd => (
                        <option key={opd.id} value={opd.id}>{opd.name}</option>
                      ))}
                    </select>
                  ) : (
                    user.opds?.name || '-'
                  )}
                </td>
                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
                  {new Date(user.created_at).toLocaleDateString('id-ID')}
                </td>
                <td style={{ padding: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                  {editingUserId === user.id ? (
                    <>
                      <button onClick={() => handleUpdateUser(user.id)} className="btn-primary" style={{padding: '0.5rem'}} disabled={loading}>Simpan</button>
                      <button onClick={() => setEditingUserId(null)} className="btn-secondary" style={{padding: '0.5rem'}}><X size={16}/></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingUserId(user.id); setEditFormData({ name: user.name, role: user.role, opd_id: user.opd_id || '' }); }} className="btn-secondary" style={{padding: '0.5rem', color: 'var(--primary-color)'}} disabled={loading}>Edit</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="btn-secondary" style={{padding: '0.5rem', color: 'var(--error-color)'}} disabled={loading}>Hapus</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {usersList.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Memuat data akun...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
