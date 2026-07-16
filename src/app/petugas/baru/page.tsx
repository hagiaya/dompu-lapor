'use client';
import { UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TugasBaruPetugas() { 
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Fetch report_progress assigned to this user with status ACCEPTED
    const { data: pData } = await supabase.from('report_progress')
      .select(`
        id, report_id, status, description, created_at,
        reports ( ticket_id, complaint, lat, lng )
      `)
      .eq('status', 'ACCEPTED')
      .eq('employee_id', user.id)
      .order('created_at', { ascending: false });
      
    if (pData) setTasks(pData);
    setLoading(false);
  };

  const handleAcceptTask = async (progressId: string, reportId: string) => {
    setIsAccepting(prev => ({ ...prev, [progressId]: true }));
    try {
      const res = await fetch('/api/petugas/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId, reportId })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Remove from list after accepting
      setTasks(tasks.filter(t => t.id !== progressId));
      alert('Tugas berhasil diterima dan dipindahkan ke halaman "Saat Ini"!');
    } catch (err: any) {
      console.error(err);
      alert('Gagal menerima tugas: ' + (err.message || 'Terjadi kesalahan'));
    }
    setIsAccepting(prev => ({ ...prev, [progressId]: false }));
  };

  return (
    <div style={{ padding: '1.25rem' }}>
      <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        <UserCheck size={20}/> Tugas Baru ({tasks.length})
      </h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Memeriksa tugas baru...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.length > 0 ? tasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1.25rem', borderLeft: '4px solid var(--error-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>{task.reports?.ticket_id}</strong>
                <span style={{ color: 'var(--error-color)', fontSize: '0.75rem', fontWeight: 'bold' }}>Baru Saja</span>
              </div>
              <p style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {task.reports?.complaint.length > 60 ? task.reports?.complaint.substring(0, 60) + '...' : task.reports?.complaint}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {task.description || 'Tidak ada instruksi khusus.'}
              </p>
              <button 
                onClick={() => handleAcceptTask(task.id, task.report_id)}
                disabled={isAccepting[task.id]}
                className="btn-primary" 
                style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', opacity: isAccepting[task.id] ? 0.7 : 1 }}
              >
                <CheckCircle2 size={18}/> {isAccepting[task.id] ? 'Memproses...' : 'Terima Tugas'}
              </button>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }}/>
              <p>Belum ada tugas baru untuk Anda hari ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  ); 
}