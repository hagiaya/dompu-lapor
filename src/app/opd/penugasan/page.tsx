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
  const [currentOpdId, setCurrentOpdId] = useState('');

  // Add Employee Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('opd_id').eq('id', user.id).single();
    const opdId = profile?.opd_id;
    setCurrentOpdId(opdId);

    // Fetch reports assigned to THIS OPD
    const { data: rData } = await supabase.from('reports')
      .select('id, ticket_id, complaint, report_progress(id)')
      .eq('status', 'ACCEPTED')
      .eq('opd_id', opdId)
      .order('created_at', { ascending: false });
    
    if (rData) {
      // Filter out reports that already have an entry in report_progress
      const unassignedReports = rData.filter(r => !r.report_progress || r.report_progress.length === 0);
      setReports(unassignedReports);
    }

    // Fetch employees in THIS OPD
    const { data: eData } = await supabase.from('profiles')
      .select('id, name, role')
      .eq('role', 'EMPLOYEE')
      .eq('opd_id', opdId);
      
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
    
    try {
      const res = await fetch('/api/opd/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReportId,
          employeeId: selectedEmployeeId,
          instruction: instruction
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      alert('Penugasan berhasil dibuat!');
      // Reset form
      setSelectedReportId('');
      setSelectedEmployeeId('');
      setInstruction('');
      // Refresh data
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Gagal membuat penugasan: ' + (err.message || 'Kesalahan sistem'));
    }
    setIsSubmitting(false);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEmpName,
          email: newEmpEmail,
          password: newEmpPassword,
          role: 'EMPLOYEE',
          opd_id: currentOpdId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Pegawai berhasil ditambahkan!');
        setShowAddModal(false);
        setNewEmpName('');
        setNewEmpEmail('');
        setNewEmpPassword('');
        fetchData(); // Refresh the employee dropdown
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem.');
    }
    setIsCreating(false);
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Pilih Petugas Lapangan</label>
                  <button type="button" onClick={() => setShowAddModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    + Tambah Pegawai Baru
                  </button>
                </div>
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

      {/* Modal Tambah Pegawai */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '1rem', background: '#fff' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Tambah Pegawai Baru</h3>
            <form onSubmit={handleCreateEmployee}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input type="text" required className="form-input" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="Contoh: Budi Santoso" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Pegawai</label>
                <input type="email" required className="form-input" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} placeholder="Contoh: budi@dompu.go.id" />
              </div>
              <div className="form-group">
                <label className="form-label">Password Sementara</label>
                <input type="password" required className="form-input" value={newEmpPassword} onChange={e => setNewEmpPassword(e.target.value)} placeholder="Minimal 6 karakter" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
                <button type="submit" disabled={isCreating} className="btn-primary" style={{ flex: 1, opacity: isCreating ? 0.7 : 1 }}>
                  {isCreating ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}