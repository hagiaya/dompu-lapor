'use client';

import { Users, UserPlus, Shield, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createUserAccount } from '@/app/actions/createUser';

export default function ManajemenPenggunaAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [opds, setOpds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'OPD' | 'BUPATI'>('OPD');
  const [opdId, setOpdId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Ambil daftar pengguna (hanya OPD dan BUPATI)
    const { data: pData } = await supabase.from('profiles')
      .select(`id, name, role, created_at, opd_id, opds ( name )`)
      .in('role', ['OPD', 'BUPATI'])
      .order('created_at', { ascending: false });
    
    if (pData) setUsers(pData);

    // Ambil daftar instansi OPD untuk pilihan dropdown
    const { data: oData } = await supabase.from('opds').select('id, name').order('name');
    if (oData) setOpds(oData);

    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Validasi sederhana
    if (role === 'OPD' && !opdId) {
      setMessage({ type: 'error', text: 'Pilih OPD yang sesuai untuk akun ini.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createUserAccount({
        name,
        email,
        role,
        opdId: role === 'OPD' ? opdId : undefined
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Berhasil! Akun ${res.user?.name} dibuat dengan password default: ${res.user?.defaultPassword}` });
        setName('');
        setEmail('');
        setRole('OPD');
        setOpdId('');
        fetchData();
      } else {
        setMessage({ type: 'error', text: res.error || 'Terjadi kesalahan.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Koneksi ke server gagal.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{padding: '2rem', minHeight: '100vh', background: 'var(--background)'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
        <Users/> Manajemen Pengguna Sistem
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Form Tambah Pengguna */}
        <div className="glass-panel" style={{padding: '1.5rem', borderRadius: '1rem'}}>
          <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>
            <UserPlus size={20} /> Buat Akun Baru
          </h3>
          
          {message && (
            <div style={{ padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', 
              background: message.type === 'success' ? '#dcfce7' : '#fee2e2', 
              color: message.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#f87171'}` 
            }}>
              {message.type === 'success' && <CheckCircle size={16} style={{display:'inline', marginRight:'0.5rem', verticalAlign:'text-bottom'}}/>}
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Lengkap Pengguna</label>
              <input type="text" className="form-input" placeholder="Misal: Kepala Dinas PUPR" required value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Login</label>
              <input type="email" className="form-input" placeholder="pupr@dompu.go.id" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tingkat Akses (Role)</label>
              <select className="form-input" value={role} onChange={e => setRole(e.target.value as any)}>
                <option value="OPD">Kepala / Admin OPD</option>
                <option value="BUPATI">Bupati (Viewer Dashboard)</option>
              </select>
            </div>

            {role === 'OPD' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pilih Instansi OPD</label>
                <select className="form-input" value={opdId} onChange={e => setOpdId(e.target.value)} required>
                  <option value="" disabled>Pilih OPD terkait...</option>
                  {opds.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Memproses...' : 'Buat Akun Sekarang'}
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>*Password default akan diberikan secara otomatis dan bisa diubah oleh pengguna nanti.</p>
          </form>
        </div>

        {/* Tabel Daftar Pengguna */}
        <div className="glass-panel" style={{padding: '1.5rem', borderRadius: '1rem'}}>
          <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>
            <Shield size={20} /> Daftar Akun (OPD & Bupati)
          </h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data pengguna...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {users.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', background: 'var(--surface)' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem', fontSize: '1rem' }}>{u.name}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ background: u.role === 'BUPATI' ? '#f3e8ff' : '#e0e7ff', color: u.role === 'BUPATI' ? '#7e22ce' : '#4338ca', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        {u.role}
                      </span>
                      {u.opds && <span>• {u.opds.name}</span>}
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Belum ada pengguna terdaftar.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
