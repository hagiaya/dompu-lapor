'use client';
import { FileText, Search, Filter, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LaporanAdmin() { 
  const [reports, setReports] = useState<any[]>([]);
  const [opds, setOpds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch reports
    const { data: rData } = await supabase.from('reports').select(`
      id, ticket_id, reporter_name, reporter_wa, complaint, status, created_at, opd_id, photo_url,
      categories ( name ),
      districts ( name ),
      villages ( name )
    `).order('created_at', { ascending: false });
    
    if (rData) setReports(rData);

    // Fetch opds for assignment
    const { data: oData } = await supabase.from('opds').select('id, name');
    if (oData) setOpds(oData);
    
    setLoading(false);
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', reportId);
    if (!error) {
      fetchData(); // refresh data
    } else {
      console.error(error);
      alert('Gagal mengubah status');
    }
  };

  const assignOpd = async (reportId: string, opdId: string) => {
    const { error } = await supabase.from('reports').update({ opd_id: opdId, status: 'ACCEPTED' }).eq('id', reportId);
    if (!error) {
      fetchData();
    } else {
      console.error(error);
      alert('Gagal assign OPD');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef3c7', text: '#d97706' };
      case 'ACCEPTED': return { bg: '#e0e7ff', text: '#4338ca' };
      case 'IN_PROGRESS': return { bg: '#dbeafe', text: '#2563eb' };
      case 'COMPLETED': return { bg: '#dcfce7', text: '#15803d' };
      case 'REJECTED': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <div style={{padding: '2rem', minHeight: '100vh', background: 'var(--background)'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
        <FileText/> Manajemen Seluruh Laporan
      </h1>
      
      <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <div className="form-group" style={{marginBottom: 0}}>
              <input type="text" className="form-input" placeholder="Cari tiket..." style={{width: '250px'}}/>
            </div>
            <button className="btn-secondary"><Search size={16}/></button>
          </div>
          <button className="btn-secondary"><Filter size={16}/> Filter Status</button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Memuat data laporan...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Tiket</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Pelapor</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Kategori</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Assign OPD</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? reports.map(r => {
                  const colors = getStatusColor(r.status);
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <strong>{r.ticket_id}</strong><br/>
                        <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                          {new Date(r.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {r.reporter_name}<br/>
                        <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{r.reporter_wa}</span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>{r.categories?.name || '-'}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ background: colors.bg, color: colors.text, padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <select 
                          className="form-input" 
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }} 
                          value={r.opd_id || ''} 
                          onChange={(e) => assignOpd(r.id, e.target.value)}
                        >
                          <option value="" disabled>Pilih OPD...</option>
                          {opds.map(opd => (
                            <option key={opd.id} value={opd.id}>{opd.name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {r.status === 'PENDING' && (
                            <>
                              <button onClick={() => updateStatus(r.id, 'ACCEPTED')} className="btn-secondary" style={{padding: '0.5rem', color: '#15803d', borderColor: '#15803d'}} title="Terima">
                                <Check size={16}/>
                              </button>
                              <button onClick={() => updateStatus(r.id, 'REJECTED')} className="btn-secondary" style={{padding: '0.5rem', color: '#b91c1c', borderColor: '#b91c1c'}} title="Tolak">
                                <X size={16}/>
                              </button>
                            </>
                          )}
                          <button onClick={() => setSelectedReport(r)} className="btn-secondary" style={{padding: '0.5rem 1rem', fontSize: '0.85rem'}}>Detail</button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Belum ada laporan masuk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setSelectedReport(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Detail Laporan</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No. Tiket</p>
                <p style={{ fontWeight: 'bold' }}>{selectedReport.ticket_id}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tanggal Lapor</p>
                <p style={{ fontWeight: 'bold' }}>{new Date(selectedReport.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status</p>
                <p style={{ fontWeight: 'bold', color: getStatusColor(selectedReport.status).text }}>{selectedReport.status}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pelapor</p>
                <p style={{ fontWeight: 'bold' }}>{selectedReport.reporter_name}</p>
                <p style={{ fontSize: '0.85rem' }}>{selectedReport.reporter_wa}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lokasi</p>
                <p style={{ fontWeight: 'bold' }}>Desa {selectedReport.villages?.name || '-'}</p>
                <p style={{ fontSize: '0.85rem' }}>Kec. {selectedReport.districts?.name || '-'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kategori</p>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{selectedReport.categories?.name || '-'}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Isi Keluhan</p>
              <p style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                {selectedReport.complaint}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Foto Bukti Laporan</p>
              {selectedReport.photo_url ? (
                <div style={{ width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedReport.photo_url} alt="Foto Laporan" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              ) : (
                <div style={{ width: '100%', padding: '2rem', borderRadius: '0.5rem', background: '#f8fafc', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  Pelapor tidak melampirkan foto.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  ); 
}