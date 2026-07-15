'use client';

import { Users, UserPlus, HardHat, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createUserAccount } from '@/app/actions/createUser';

export default function ManajemenPenggunaOPD() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myOpdId, setMyOpdId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    checkSessionAndFetchData();
  }, []);

  const checkSessionAndFetchData = async () => {
    setLoading(true);
    
    // Ambil sesi user saat ini
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Ambil opd_id dari profil user saat ini
      const { data: profile } = await supabase.from('profiles').select('opd_id').eq('id', session.user.id).single();
      if (profile && profile.opd_id) {
        setMyOpdId(profile.opd_id);
        fetchEmployees(profile.opd_id);
      } else {
        setLoading(false);
      }
    } else {
      // Fallback untuk demo jika tidak login (ambil OPD pertama saja)
      const { data: firstOpd } = await supabase.from('opds').select('id').limit(1).single();
      if (firstOpd) {
        setMyOpdId(firstOpd.id);
        fetchEmployees(firstOpd.id);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchEmployees = async (opdId: string) => {
    const { data: eData } = await supabase.from('profiles')
      .select(`id, name, created_at`)
      .eq('role', 'EMPLOYEE')
      .eq('opd_id', opdId)
      .order('created_at', { ascending: false });
    
    if (eData) setEmployees(eData);
    setLoading(false);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myOpdId) {
      setMessage({ type: 'error', text: 'Tidak dapat mengidentifikasi Instansi Anda.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await createUserAccount({
        name,
        email,
        role: 'EMPLOYEE',
        opdId: myOpdId
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Berhasil! Akun ${res.user?.name} (Tim Lapangan) dibuat. Sandi default: ${res.user?.defaultPassword}` });
        setName('');
        setEmail('');
        fetchEmployees(myOpdId);
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
        <Users/> Kelola Petugas Lapangan
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Form Tambah Petugas */}
        <div className="glass-panel" style={{padding: '1.5rem', borderRadius: '1rem', height: 'fit-content'}}>
          <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>
            <UserPlus size={20} /> Buat Akun Tim/Petugas Baru
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

          <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Tim / Petugas</label>
              <input type="text" className="form-input" placeholder="Misal: Tim Reaksi Cepat 1" required value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Login</label>
              <input type="email" className="form-input" placeholder="tim1@pupr.dompu.go.id" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <button type="submit" disabled={isSubmitting || !myOpdId} className="btn-primary" style={{ marginTop: '0.5rem', opacity: (isSubmitting || !myOpdId) ? 0.7 : 1 }}>
              {isSubmitting ? 'Memproses...' : 'Buat Akun Petugas'}
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>*Akun otomatis dihubungkan ke instansi Anda. Sandi default diberikan otomatis.</p>
          </form>
        </div>

        {/* Tabel Daftar Petugas */}
        <div className="glass-panel" style={{padding: '1.5rem', borderRadius: '1rem'}}>
          <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>
            <HardHat size={20} /> Daftar Petugas (Instansi Anda)
          </h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data petugas...</div>
          ) : !myOpdId ? (
            <div style={{ textAlign: 'center', color: '#b91c1c' }}>Anda tidak terdaftar dalam instansi mana pun.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {employees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', background: 'var(--surface)' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem', fontSize: '1rem' }}>{emp.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Terdaftar pada: {new Date(emp.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Aktif
                  </span>
                </div>
              ))}
              {employees.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Belum ada petugas terdaftar di OPD Anda.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
