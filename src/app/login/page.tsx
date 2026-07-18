'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Shield, Mail, Lock, LogIn, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Fetch User Profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      // 3. Route based on role
      const role = profile.role;
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'OPD') router.push('/opd');
      else if (role === 'BUPATI') router.push('/bupati');
      else router.push('/petugas'); // EMPLOYEE default

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '1rem' }}>
      
      {/* Mobile Device Frame Simulation / Container */}
      <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', borderRadius: '1.5rem', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--primary-color)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 8px 16px rgba(30, 58, 138, 0.2)' }}>
            <Shield size={32} color="white" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Portal Internal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>Masuk untuk mengelola layanan Lapor Dompu.</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fca5a5' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16}/> Email Akses</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="pegawai@dompu.go.id" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={16}/> Kata Sandi</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '3rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem', fontSize: '1.05rem', marginTop: '1rem', borderRadius: '0.75rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? (
               <><Loader2 size={20} className="animate-spin" /> Memeriksa...</>
            ) : (
               <><LogIn size={20} /> Masuk Sistem</>
            )}
          </button>
        </form>
        
        <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', transition: 'color 0.2s' }}>
             <ArrowLeft size={16} /> Kembali ke Halaman Rakyat
          </Link>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
