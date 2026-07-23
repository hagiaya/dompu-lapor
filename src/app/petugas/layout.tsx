'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ClipboardCheck, UserCheck, History, LogOut } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newTasksCount, setNewTasksCount] = useState(0);

  useEffect(() => {
    fetchNewTasksCount();
    
    // Set up a simple poll or just fetch once (realtime would be better but this is fine for now)
    const interval = setInterval(fetchNewTasksCount, 30000);
    return () => clearInterval(interval);
  }, [pathname]); // Refetch when route changes

  const fetchNewTasksCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { count } = await supabase.from('report_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACCEPTED')
      .eq('employee_id', user.id);
      
    if (count !== null) setNewTasksCount(count);
  };
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE']}>
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '768px', background: 'var(--background)', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
        
        {/* Header / Top Bar */}
        <header style={{ position: 'sticky', top: 0, padding: '1rem 1.25rem', background: 'var(--surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo copy.jpeg" alt="SiMAJU Logo" width="32" height="32" style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <h2 style={{ color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>Si<span style={{ color: 'var(--success-color)' }}>MAJU</span> Petugas</h2>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error-color)', display: 'flex', alignItems: 'center' }}>
            <LogOut size={20} />
          </button>
        </header>

        {/* Scrollable Main Content */}
        <main style={{ flex: 1, padding: '0', paddingBottom: '90px' }}>
          {children}
        </main>

        {/* Bottom Navigation Bar */}
        <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '768px', background: 'var(--surface)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', padding: '0.75rem 0', zIndex: 40, boxShadow: '0 -4px 10px rgba(0,0,0,0.03)', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          
          <Link href="/petugas" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: pathname === '/petugas' ? 'var(--secondary-color)' : 'var(--text-secondary)', textDecoration: 'none' }}>
            <ClipboardCheck size={24} />
            <span style={{ fontSize: '0.7rem', fontWeight: pathname === '/petugas' ? 'bold' : 'normal' }}>Saat Ini</span>
          </Link>

          <Link href="/petugas/baru" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: pathname.includes('/petugas/baru') ? 'var(--secondary-color)' : 'var(--text-secondary)', textDecoration: 'none' }}>
            <div style={{ position: 'relative' }}>
              <UserCheck size={24} />
              {newTasksCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: 'var(--error-color)', color: 'white', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {newTasksCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: pathname.includes('/petugas/baru') ? 'bold' : 'normal' }}>Tugas Baru</span>
          </Link>

          <Link href="/petugas/riwayat" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: pathname.includes('/petugas/riwayat') ? 'var(--secondary-color)' : 'var(--text-secondary)', textDecoration: 'none' }}>
            <History size={24} />
            <span style={{ fontSize: '0.7rem', fontWeight: pathname.includes('/petugas/riwayat') ? 'bold' : 'normal' }}>Riwayat</span>
          </Link>

        </nav>
      </div>
    </div>
    </ProtectedRoute>
  );
}