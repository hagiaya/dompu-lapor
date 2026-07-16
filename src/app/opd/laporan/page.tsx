'use client';
import { Eye, Search, CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PantauLaporanOPD() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('opd_id').eq('id', user.id).single();
    const opdId = profile?.opd_id;

    const { data: rData } = await supabase.from('reports')
      .select(`
        id, ticket_id, complaint, status, created_at, reporter_name, reporter_wa, photo_url,
        villages ( name ),
        categories ( name ),
        report_progress (
          status, description, created_at, evidence_url,
          profiles ( name )
        )
      `)
      .eq('opd_id', opdId)
      .order('created_at', { ascending: false });
      
    if (rData) setReports(rData);
    setLoading(false);
  }

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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 0' }}>Tiket</th>
                  <th style={{ padding: '1rem 0' }}>Kategori & Keluhan</th>
                  <th style={{ padding: '1rem 0' }}>Lokasi (Desa)</th>
                  <th style={{ padding: '1rem 0' }}>Status</th>
                  <th style={{ padding: '1rem 0', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? reports.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0' }}>
                      <strong>{r.ticket_id}</strong><br/>
                      <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                    </td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ fontSize: '0.8rem', background: 'var(--surface)', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '4px' }}>{r.categories?.name}</span><br/>
                      {r.complaint.length > 50 ? r.complaint.substring(0, 50) + '...' : r.complaint}
                    </td>
                    <td style={{ padding: '1rem 0' }}>{r.villages?.name || '-'}</td>
                    <td style={{ padding: '1rem 0' }}>{getStatusBadge(r.status)}</td>
                    <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                      <button onClick={() => setSelectedReport(r)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Detail</button>
                    </td>
                  </tr>
                )) : (
                   <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Tidak ada data laporan.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Laporan */}
      {selectedReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Detail Tiket {selectedReport.ticket_id}</h3>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Status Saat Ini</p>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Waktu Pelaporan</p>
                  <strong>{new Date(selectedReport.created_at).toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary-color)' }}>Informasi Pelapor</h4>
                <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Nama:</strong> {selectedReport.reporter_name || 'Hamba Allah'}</p>
                <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>No WhatsApp:</strong> {selectedReport.reporter_wa || '-'}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary-color)' }}>Keluhan Warga</h4>
                <p style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.95rem', margin: 0, border: '1px solid var(--border-color)' }}>
                  {selectedReport.complaint}
                </p>
                
                {selectedReport.photo_url && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Foto Bukti Keluhan:</p>
                    <img src={selectedReport.photo_url} alt="Bukti laporan" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: '#000' }} />
                  </div>
                )}
              </div>

              {selectedReport.report_progress && selectedReport.report_progress.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Progres Tindak Lanjut</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedReport.report_progress.sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((prog: any, idx: number) => (
                      <div key={idx} style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: prog.status === 'COMPLETED' ? '#f0fdf4' : '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--primary-color)' }}>{prog.status === 'COMPLETED' ? 'Tugas Selesai' : 'Sedang Dikerjakan'}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(prog.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
                          Petugas Lapangan: <strong>{prog.profiles?.name || 'Tim OPD'}</strong>
                        </p>
                        {prog.description && (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Catatan: {prog.description}</p>
                        )}
                        {prog.evidence_url && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Foto Bukti Perbaikan:</p>
                            <img src={prog.evidence_url} alt="Bukti perbaikan" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'right', background: 'var(--surface)' }}>
              <button onClick={() => setSelectedReport(null)} className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}