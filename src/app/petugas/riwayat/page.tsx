'use client';
import { History, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RiwayatPetugas() { 
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Fetch completed tasks for this employee
    const { data: pData } = await supabase.from('report_progress')
      .select(`
        id, report_id, status, description, created_at, evidence_url,
        reports ( ticket_id, complaint )
      `)
      .eq('status', 'COMPLETED')
      .eq('employee_id', user.id)
      .order('created_at', { ascending: false });
      
    if (pData) setTasks(pData);
    setLoading(false);
  };

  return (
    <div style={{ padding: '1.25rem' }}>
      <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        <History size={20}/> Riwayat Selesai ({tasks.length})
      </h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Memuat riwayat...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.length > 0 ? tasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1.25rem', borderLeft: '4px solid var(--success-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>{task.reports?.ticket_id}</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{new Date(task.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              <p style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {task.reports?.complaint.length > 60 ? task.reports?.complaint.substring(0, 60) + '...' : task.reports?.complaint}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                {task.description || 'Diselesaikan.'}
              </p>
              {task.evidence_url && (
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <ImageIcon size={18} color="var(--secondary-color)"/> Foto Tersimpan
                </div>
              )}
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }}/>
              <p>Belum ada riwayat tugas yang Anda selesaikan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  ); 
}