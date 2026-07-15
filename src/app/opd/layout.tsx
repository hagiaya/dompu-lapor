'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, Eye, ClipboardList, TrendingUp, LogOut } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabaseClient';

export default function OPDLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push('/login');
  };
  return (
    <ProtectedRoute allowedRoles={['OPD', 'ADMIN']}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
        <aside style={{ width: '280px', background: 'var(--surface)', borderRight: '1px solid var(--border-color)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ marginBottom: '2.5rem', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo copy.jpeg" alt="SiMAJU Logo" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <h2 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>SiMAJU</h2>
          </div>
          <p style={{ color: 'var(--secondary-color)', fontSize: '0.9rem', fontWeight: '600', marginLeft: '3.25rem' }}>Panel Kepala OPD</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/opd" className={`nav-item ${pathname === '/opd' ? 'active' : ''}`}><Briefcase size={20} /> Overview</Link>
          <Link href="/opd/laporan" className={`nav-item ${pathname.includes('/opd/laporan') ? 'active' : ''}`}><Eye size={20} /> Pantau Laporan</Link>
          <Link href="/opd/penugasan" className={`nav-item ${pathname.includes('/opd/penugasan') ? 'active' : ''}`}><ClipboardList size={20} /> Penugasan Pegawai</Link>
          <Link href="/opd/statistik" className={`nav-item ${pathname.includes('/opd/statistik') ? 'active' : ''}`}><TrendingUp size={20} /> Statistik Penyelesaian</Link>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error-color)', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}><LogOut size={20} /> Keluar OPD</button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '0', maxHeight: '100vh', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
    </ProtectedRoute>
  );
}