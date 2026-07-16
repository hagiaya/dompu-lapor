'use client';
import { Briefcase, Eye, ClipboardList, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OPDDashboard() {
  const [latestBroadcast, setLatestBroadcast] = useState<any>(null);
  const [opdName, setOpdName] = useState('Memuat Data OPD...');
  const [opdId, setOpdId] = useState<string | null>(null);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [priorityReports, setPriorityReports] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      // 1. Get logged in user and profile
      const { data: { user } } = await supabase.auth.getUser();
      let currentOpdId = null;

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('opd_id, opds(name)').eq('id', user.id).single();
        if (profile) {
          currentOpdId = profile.opd_id;
          setOpdId(profile.opd_id);
          if (profile.opds) setOpdName(profile.opds.name);
          else setOpdName('Semua Instansi (Global)');
        }
      }

      // 2. Fetch Broadcast
      const { data: broadcast } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(1).single();
      if (broadcast) setLatestBroadcast(broadcast);

      // 3. Fetch Reports for this OPD
      let reportQuery = supabase.from('reports').select('*');
      if (currentOpdId) {
        reportQuery = reportQuery.eq('opd_id', currentOpdId);
      }
      
      const { data: reports } = await reportQuery;
      
      if (reports) {
        const pending = reports.filter(r => r.status === 'PENDING' || r.status === 'ACCEPTED').length;
        const inProgress = reports.filter(r => r.status === 'IN_PROGRESS').length;
        const completed = reports.filter(r => r.status === 'COMPLETED').length;
        setStats({ pending, inProgress, completed });

        // Priority Reports (oldest pending)
        const pendingReports = reports.filter(r => r.status === 'PENDING' || r.status === 'ACCEPTED')
                                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                      .slice(0, 5);
        setPriorityReports(pendingReports);
      }

      // 4. Fetch Employees for this OPD
      let empQuery = supabase.from('profiles').select('*').eq('role', 'EMPLOYEE');
      if (currentOpdId) {
        empQuery = empQuery.eq('opd_id', currentOpdId);
      }
      const { data: emps } = await empQuery;
      if (emps) setEmployees(emps);
    }

    loadDashboardData();
  }, []);

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'var(--background)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'var(--surface)', padding: '1.5rem 2.5rem', borderRadius: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800' }}>
            <Briefcase size={28} color="var(--secondary-color)" /> Panel Kontrol Instansi OPD
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>{opdName}</p>
        </div>
      </header>

      {latestBroadcast && (
        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={24} color="#1d4ed8" style={{ marginTop: '0.25rem' }} />
          <div>
            <h3 style={{ color: '#1e3a8a', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Instruksi Khusus Bupati</h3>
            <p style={{ color: '#1e40af', fontSize: '1rem' }}>{latestBroadcast.message}</p>
            <p style={{ color: '#60a5fa', fontSize: '0.85rem', marginTop: '0.5rem' }}>Diterima pada {new Date(latestBroadcast.created_at).toLocaleString('id-ID')}</p>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--error-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Laporan Menunggu Disposisi</h3>
          <p style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-color)' }}>{stats.pending} {stats.pending > 0 && <span style={{fontSize: '1rem', color: 'var(--error-color)', fontWeight: 'bold'}}><AlertTriangle size={16}/> Segera Tindak</span>}</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--warning-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Sedang Dalam Pengerjaan</h3>
          <p style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-color)' }}>{stats.inProgress}</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--success-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Berhasil Diselesaikan</h3>
          <p style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-color)' }}>{stats.completed}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        {/* Laporan Terbaru Area */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
              <Eye size={22} color="var(--secondary-color)" /> Antrean Laporan Prioritas
            </h2>
            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Lihat Semua</button>
          </div>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 0' }}>Tiket / Masalah</th>
                <th style={{ padding: '1rem 0' }}>SLA Waktu</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {priorityReports.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada antrean laporan saat ini.</td>
                </tr>
              ) : (
                priorityReports.map(report => (
                  <tr key={report.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0' }}>
                      <strong style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>{report.ticket_id}</strong><br />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{report.complaint.substring(0, 50)}...</span>
                    </td>
                    <td style={{ padding: '1rem 0', color: 'var(--error-color)', fontWeight: 'bold' }}>
                      <Clock size={14} style={{display: 'inline', marginBottom: '-2px'}}/> 
                      {(() => {
                        const days = Math.floor((new Date().getTime() - new Date(report.created_at).getTime()) / (1000 * 3600 * 24));
                        return days > 0 ? `Menunggu ${days} Hari` : 'Hari Ini';
                      })()}
                    </td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.4rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700' }}>
                        {report.status === 'PENDING' ? 'Menunggu Disposisi' : report.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Daftar Petugas Area */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
            <Users size={22} color="var(--success-color)" /> Status Petugas Lapangan
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {employees.length === 0 ? (
               <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada petugas lapangan didaftarkan.</div>
            ) : (
              employees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--background)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{emp.name}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Petugas Lapangan</p>
                  </div>
                  <span style={{ width: '12px', height: '12px', background: 'var(--success-color)', borderRadius: '50%', boxShadow: '0 0 0 3px #dcfce7' }}></span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}