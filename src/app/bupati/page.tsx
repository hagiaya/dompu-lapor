'use client';
import Map from '@/components/Map';
import { ShieldCheck, Activity, FileText, CheckCircle, Clock, AlertOctagon, Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function BupatiDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0
  });
  const [urgentReport, setUrgentReport] = useState<any>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);
    
    const { error } = await supabase.from('broadcasts').insert([{ message: broadcastMessage }]);
    
    setIsSendingBroadcast(false);
    if (!error) {
      alert('Instruksi berhasil dikirim ke seluruh OPD!');
      setBroadcastMessage('');
    } else {
      alert('Gagal mengirim instruksi: ' + error.message);
    }
  };

  useEffect(() => {
    async function fetchStats() {
      // Total Laporan
      const { count: totalCount } = await supabase.from('reports').select('*', { count: 'exact', head: true });
      
      // Sedang Dikerjakan (ACCEPTED atau IN_PROGRESS)
      const { count: inProgressCount } = await supabase.from('reports')
        .select('*', { count: 'exact', head: true })
        .in('status', ['ACCEPTED', 'IN_PROGRESS']);
        
      // Selesai
      const { count: completedCount } = await supabase.from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'COMPLETED');

      setStats({
        total: totalCount || 0,
        inProgress: inProgressCount || 0,
        completed: completedCount || 0
      });

      // Isu Paling Mendesak (laporan PENDING terbaru)
      const { data: urgentData } = await supabase.from('reports')
        .select('complaint, status, ticket_id, categories(name), villages(name)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (urgentData) {
        setUrgentReport(urgentData);
      }
    }
    
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'var(--background)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'var(--surface)', padding: '1.5rem 2.5rem', borderRadius: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', fontWeight: '800' }}>
            <ShieldCheck size={32} color="var(--secondary-color)" /> Pusat Komando Bupati
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Pantau seluruh progres dan aspirasi masyarakat Kabupaten Dompu secara eksekutif.</p>
        </div>
      </header>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Laporan Masuk</h3>
            <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.total}</p>
          </div>
          <FileText size={56} color="var(--secondary-color)" style={{ opacity: 0.1 }} />
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--warning-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sedang Dikerjakan OPD</h3>
            <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.inProgress}</p>
          </div>
          <Clock size={56} color="var(--warning-color)" style={{ opacity: 0.1 }} />
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Laporan Diselesaikan</h3>
            <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.completed}</p>
          </div>
          <CheckCircle size={56} color="var(--success-color)" style={{ opacity: 0.1 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
        {/* Peta Interaktif Besar */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)' }}>
              <Activity size={24} color="var(--error-color)" /> Pantauan Peta Wilayah Real-time
            </h2>
          </div>
          <div style={{ width: '100%', height: '500px', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            <Map center={[-8.5333, 118.4667]} zoom={12} />
          </div>
        </div>
        
        {/* Isu Urgent & Tindakan Eksekutif */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', background: '#fff1f2', border: '1px solid #fecdd3' }}>
             <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#be123c', marginBottom: '1rem' }}>
              <AlertOctagon size={20} /> Isu Paling Mendesak
            </h2>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '0.75rem', marginBottom: '1rem' }}>
              {urgentReport ? (
                <>
                  <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{urgentReport.categories?.name || 'Keluhan Umum'} di {urgentReport.villages?.name || 'Dompu'}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tiket: {urgentReport.ticket_id}. Keluhan: "{urgentReport.complaint?.substring(0, 50)}..."</p>
                </>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Belum ada laporan mendesak saat ini.</p>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
             <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
              <Megaphone size={20} color="var(--secondary-color)" /> Pesan Broadcast Eksekutif
            </h2>
            <textarea 
              className="form-input" 
              rows={4} 
              placeholder="Kirim instruksi khusus ke seluruh Kepala OPD secara instan..." 
              style={{ marginBottom: '1rem' }}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              disabled={isSendingBroadcast}
            ></textarea>
            <button 
              className="btn-primary" 
              style={{ width: '100%' }}
              onClick={handleSendBroadcast}
              disabled={isSendingBroadcast || !broadcastMessage.trim()}
            >
              {isSendingBroadcast ? 'Mengirim...' : 'Kirim Instruksi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}