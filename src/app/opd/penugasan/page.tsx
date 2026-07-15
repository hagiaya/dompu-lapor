'use client';
import { ClipboardList, UserPlus, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PenugasanOPD() {
  const [reports, setReports] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedReportId, setSelectedReportId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [instruction, setInstruction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch reports assigned to OPD (status ACCEPTED means Admin has passed it to OPD)
    const { data: rData } = await supabase.from('reports')
      .select('id, ticket_id, complaint')
      .eq('status', 'ACCEPTED')
      .order('created_at', { ascending: false });
    
    if (rData) setReports(rData);

    // Fetch employees
    const { data: eData } = await supabase.from('profiles')
      .select('id, name, role')
      .eq('role', 'EMPLOYEE');
      
    if (eData) setEmployees(eData);
    
    setLoading(false);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !selectedEmployeeId) {
      alert('Pilih tiket laporan dan petugas terlebih dahulu.');
      return;
    }
    
    setIsSubmitting(true);
    
    // 1. Update report status to IN_PROGRESS
    const { error: rError } = await supabase.from('reports')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', selectedReportId);

    if (rError) {
      console.error(rError);
      alert('Gagal mengupdate status laporan.');
      setIsSubmitting(false);
      return;
    }

    // 2. Insert into report_progress
    const { error: pError } = await supabase.from('report_progress')
      .insert({
        report_id: selectedReportId,
        status: 'IN_PROGRESS',
        description: instruction,
        employee_id: selectedEmployeeId
      });

    if (pError) {
      console.error(pError);
      alert('Gagal membuat penugasan.');
    } else {
      alert('Penugasan berhasil dibuat!');
      // Reset form
      setSelectedReportId('');
      setSelectedEmployeeId('');
      setInstruction('');
      // Refresh data
      fetchData();
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{padding: '2rem', minHeight: '100vh', background: 'var(--background)'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
        <ClipboardList/> Penugasan Pegawai
      </h1>
      
      {loading ? (
        <div style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>Memuat data penugasan...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          {/* List Laporan */}
          <div className="glass-panel" style={{padding: '1.5rem', borderRadius: '1rem'}}>
            <h3 style={{marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between'}}>
              Laporan Belum Ditugaskan
              <span style={{ background: 'var(--error-color)', color: 'white', padding: '0.1rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem' }}>{reports.length}</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              {reports.length > 0 ? reports.map(r => (
                <div key={r.id} style={{padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', background: '#fff'}}>
                  <strong>{r.ticket_id}</strong>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0'}}>{r.complaint.substring(0, 80)}...</p>
                  <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Butuh Tindakan</span>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  <AlertCircle size={24} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }}/>
                  Semua laporan sudah ditugaskan.
                </div>
              )}
            </div>
          </div>
          
          {/* Form Assign */}
          <div className="glass-panel" style={{padding: '1.5rem', borderRadius: '1rem'}}>
            <h3 style={{marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>Form Penugasan Baru</h3>
            
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label className="form-label">Pilih Tiket Laporan</label>
                <select className="form-input" required value={selectedReportId} onChange={e => setSelectedReportId(e.target.value)}>
                  <option value="" disabled>Pilih laporan yang akan ditugaskan...</option>
                  {reports.map(r => (
                    <option key={r.id} value={r.id}>{r.ticket_id} - {r.complaint.substring(0,30)}...</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pilih Petugas Lapangan</label>
                <select className="form-input" required value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}>
                  <option value="" disabled>Pilih tim atau petugas...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Instruksi Khusus</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Tambahkan instruksi teknis..."
                  value={instruction}
                  onChange={e => setInstruction(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" disabled={isSubmitting || reports.length === 0} className="btn-primary" style={{width: '100%', opacity: (isSubmitting || reports.length === 0) ? 0.7 : 1}}>
                <UserPlus size={16}/> {isSubmitting ? 'Memproses...' : 'Tugaskan Petugas Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}