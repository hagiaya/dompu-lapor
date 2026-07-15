'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Map as MapIcon, FileText, BarChart3, LogOut } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabaseClient';

export default function BupatiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push('/login');
  };
  return (
    <ProtectedRoute allowedRoles={['BUPATI', 'ADMIN']}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
        <aside style={{ width: '280px', background: 'var(--surface)', borderRight: '1px solid var(--border-color)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ marginBottom: '2.5rem', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo copy.jpeg" alt="SiMAJU Logo" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <h2 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>SiMAJU</h2>
          </div>
          <p style={{ color: 'var(--secondary-color)', fontSize: '0.9rem', fontWeight: '600', marginLeft: '3.25rem' }}>Pusat Komando Bupati</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/bupati" className={`nav-item ${pathname === '/bupati' ? 'active' : ''}`}><Home size={20} /> Control Center</Link>
          <Link href="/bupati/peta" className={`nav-item ${pathname.includes('/bupati/peta') ? 'active' : ''}`}><MapIcon size={20} /> Peta Real-time</Link>
          <Link href="/bupati/laporan" className={`nav-item ${pathname.includes('/bupati/laporan') ? 'active' : ''}`}><FileText size={20} /> Laporan Eksekutif</Link>
          <Link href="/bupati/kinerja" className={`nav-item ${pathname.includes('/bupati/kinerja') ? 'active' : ''}`}><BarChart3 size={20} /> Kinerja OPD</Link>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error-color)', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}><LogOut size={20} /> Keluar Sistem</button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '0', maxHeight: '100vh', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
    </ProtectedRoute>
  );
}