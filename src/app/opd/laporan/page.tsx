'use client';
import { Eye, Search, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PantauLaporanOPD() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // In a real app we filter by opd_id matching the logged-in user.
      // Here we fetch all non-PENDING reports to demonstrate OPD view.
      const { data: rData } = await supabase.from('reports')
        .select(`
          id, ticket_id, complaint, status, created_at,
          villages ( name )
        `)
        .neq('status', 'PENDING')
        .neq('status', 'REJECTED')
        .order('created_at', { ascending: false });
        
      if (rData) setReports(rData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') return <span style={{ background: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>Selesai</span>;
    if (status === 'IN_PROGRESS') return <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>Sedang Dikerjakan</span>;
    return <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>Menunggu Tindakan</span>;
  }

  return (
    <div style={{padding: '2rem', minHeight: '100vh', background: 'var(--background)'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
        <Eye/> Pantau Laporan Masuk
      </h1>
      
      <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Memuat riwayat laporan...</div>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 0' }}>Tiket</th>
                <th style={{ padding: '1rem 0' }}>Deskripsi Keluhan</th>
                <th style={{ padding: '1rem 0' }}>Lokasi (Desa)</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? reports.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <strong>{r.ticket_id}</strong><br/>
                    <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                  </td>
                  <td style={{ padding: '1rem 0' }}>{r.complaint}</td>
                  <td style={{ padding: '1rem 0' }}>{r.villages?.name || '-'}</td>
                  <td style={{ padding: '1rem 0' }}>{getStatusBadge(r.status)}</td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Tidak ada data laporan.</td>
                 </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}