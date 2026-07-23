'use client';
import { Target, Map as MapIcon, CheckCircle2, Navigation, Camera, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PetugasDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTasksCount, setNewTasksCount] = useState(0);
  
  // Stats
  const [completedCount, setCompletedCount] = useState(0);

  // File upload states
  const [photoFiles, setPhotoFiles] = useState<{ [key: string]: File | null }>({});
  const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>({});

  // Progress states
  const [progressPercentage, setProgressPercentage] = useState<{ [key: string]: number }>({});
  const [progressNote, setProgressNote] = useState<{ [key: string]: string }>({});
  const [isUpdatingProgress, setIsUpdatingProgress] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Fetch IN_PROGRESS tasks assigned to this employee
    const { data: pData } = await supabase.from('report_progress')
      .select(`
        id, report_id, status, description, created_at,
        reports!inner ( ticket_id, complaint, lat, lng, status, districts(name), villages(name) )
      `)
      .eq('status', 'IN_PROGRESS')
      .eq('employee_id', user.id)
      .eq('reports.status', 'IN_PROGRESS')
      .order('created_at', { ascending: false });
      
    if (pData) {
      // Group by report_id to find the instruction (oldest row) and current progress (newest row)
      const uniqueTasks: any[] = [];
      const reportsMap = new Map();
      
      pData.forEach(task => {
        if (!reportsMap.has(task.report_id)) {
          reportsMap.set(task.report_id, []);
        }
        reportsMap.get(task.report_id).push(task);
      });

      for (const [reportId, tasksList] of reportsMap.entries()) {
        const newestTask = tasksList[0]; // because pData is sorted DESC
        const oldestTask = tasksList[tasksList.length - 1]; // This has the original instruction from OPD
        
        uniqueTasks.push({
          ...newestTask,
          instruction: oldestTask.description
        });
      }
      setTasks(uniqueTasks);
    }

    // Fetch completed count for this employee
    const { count } = await supabase.from('report_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'COMPLETED')
      .eq('employee_id', user.id);
      
    setCompletedCount(count || 0);

    // Fetch new tasks count (ACCEPTED)
    const { count: newCount } = await supabase.from('report_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACCEPTED')
      .eq('employee_id', user.id);
      
    setNewTasksCount(newCount || 0);

    setLoading(false);
  };

  const handlePhotoSelect = (taskId: string, file: File) => {
    setPhotoFiles(prev => ({ ...prev, [taskId]: file }));
  };

  const handleUpdateProgress = async (taskId: string, reportId: string) => {
    setIsUpdatingProgress(prev => ({ ...prev, [taskId]: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch('/api/petugas/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reportId: reportId,
          employeeId: user?.id,
          progressPercentage: progressPercentage[taskId] !== undefined ? progressPercentage[taskId] : 0,
          progressNote: progressNote[taskId] || ''
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      alert('Progres berhasil disimpan!');
      setProgressNote(prev => ({ ...prev, [taskId]: '' }));
      fetchData(); // Refresh to show latest update
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan progres: ' + (err.message || 'Kesalahan sistem'));
    }
    setIsUpdatingProgress(prev => ({ ...prev, [taskId]: false }));
  };

  const handleSelesai = async (progressId: string, reportId: string) => {
    const file = photoFiles[progressId];
    if (!file) {
      alert('Harap unggah bukti foto penyelesaian tugas terlebih dahulu.');
      return;
    }

    setIsSubmitting(prev => ({ ...prev, [progressId]: true }));
    let uploadedPhotoUrl = null;

    try {
      const imgFormData = new FormData();
      imgFormData.append('image', file);
      const res = await fetch(`/api/upload`, {
        method: 'POST',
        body: imgFormData
      });
      const data = await res.json();
      if (data.success) {
        uploadedPhotoUrl = data.url;
      } else {
        console.error("Upload failed", data.error);
        alert('Gagal mengunggah foto bukti.');
        setIsSubmitting(prev => ({ ...prev, [progressId]: false }));
        return;
      }
    } catch (err) {
      console.error("Upload error", err);
      alert('Terjadi kesalahan saat mengunggah foto.');
      setIsSubmitting(prev => ({ ...prev, [progressId]: false }));
      return;
    }

    try {
      const res = await fetch('/api/petugas/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId, reportId, evidenceUrl: uploadedPhotoUrl })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      alert('Tugas berhasil diselesaikan!');
      fetchData(); // refresh list
    } catch (err) {
      console.error("Update error", err);
      alert('Terjadi kesalahan saat mengupdate status.');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [progressId]: false }));
    }
  };

  return (
    <div style={{ padding: '1.25rem', background: 'var(--background)', minHeight: '100vh' }}>
      {/* Profile Card */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', padding: '1.5rem', borderRadius: '1.25rem', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.3)', marginBottom: '1.5rem', color: 'white' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '0.25rem' }}>Halo, Petugas</h1>
        <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem' }}>Tim Reaksi Cepat</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
           <p style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Tugas Selesai</p>
           <p style={{ fontSize: '2rem', fontWeight: '900', lineHeight: 1 }}>{completedCount} <span style={{fontSize:'0.9rem', fontWeight:'normal'}}>Tiket</span></p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Target size={20} color="var(--primary-color)"/> 
        <h2 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>Daftar Tugas Saat Ini</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Memuat tugas...</div>
      ) : (
        <div style={{ width: '100%' }}>
          {newTasksCount > 0 && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #f87171', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              marginBottom: '1rem', 
              display: 'flex', 
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <AlertCircle size={20} color="#dc2626" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
              <div>
                <h4 style={{ color: '#991b1b', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Ada {newTasksCount} Tugas Baru!</h4>
                <p style={{ color: '#b91c1c', margin: 0, fontSize: '0.9rem' }}>
                  Silakan cek tab <strong>Tugas Baru</strong> di menu bawah untuk menerima penugasan dari OPD sebelum tugas tersebut muncul di sini.
                </p>
              </div>
            </div>
          )}
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', background: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }}/>
              Tidak ada tugas aktif saat ini.
            </div>
          ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {tasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1.25rem', borderTop: '4px solid var(--warning-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'inline-block' }}>{task.reports?.ticket_id}</span>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>Instruksi: {task.instruction || task.description}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.25rem' }}>
                    <strong>Lokasi:</strong> Kecamatan {task.reports?.districts?.name || '-'}, Desa {task.reports?.villages?.name || '-'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>Keluhan Warga: "{task.reports?.complaint}"</p>
                </div>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                   <div style={{ width: '48px', height: '48px', background: '#e2e8f0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0 }}>
                     <MapIcon size={24} />
                   </div>
                   <div>
                     <p style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Lokasi Titik Peta</p>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{task.reports?.lat ? `${task.reports.lat.toFixed(4)}, ${task.reports.lng.toFixed(4)}` : 'Tidak ada koordinat'}</p>
                   </div>
                 </div>
                 {task.reports?.lat && (
                   <button 
                     onClick={() => window.open(`https://www.google.com/maps?q=${task.reports.lat},${task.reports.lng}`, '_blank')}
                     className="btn-secondary" 
                     style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', background: 'white' }}>
                     <Navigation size={16}/> Buka Maps
                   </button>
                 )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Lapor Progres Pekerjaan</h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                   <input 
                     type="range" min="0" max="100" 
                     value={progressPercentage[task.id] !== undefined ? progressPercentage[task.id] : 0} 
                     onChange={(e) => setProgressPercentage(prev => ({ ...prev, [task.id]: parseInt(e.target.value)}))} 
                     style={{ flex: 1, accentColor: 'var(--primary-color)' }} 
                   />
                   <span style={{ fontWeight: 'bold', width: '40px', textAlign: 'right', color: 'var(--primary-color)' }}>{progressPercentage[task.id] !== undefined ? progressPercentage[task.id] : 0}%</span>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Catatan progres (misal: Sedang menggali lubang)" 
                  className="form-input" 
                  value={progressNote[task.id] || ''} 
                  onChange={(e) => setProgressNote(prev => ({ ...prev, [task.id]: e.target.value}))} 
                  style={{ marginBottom: '0.75rem' }} 
                />
                
                <button 
                  onClick={() => handleUpdateProgress(task.id, task.report_id)} 
                  disabled={isUpdatingProgress[task.id]} 
                  className="btn-secondary" 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', opacity: isUpdatingProgress[task.id] ? 0.7 : 1 }}
                >
                  {isUpdatingProgress[task.id] ? 'Menyimpan...' : 'Simpan Progres'}
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Unggah Bukti Selesai</h4>
                <label style={{ display: 'block', border: '2px dashed var(--border-color)', padding: '1.5rem', textAlign: 'center', borderRadius: '0.75rem', cursor: 'pointer', background: '#f8fafc', marginBottom: '1rem' }}>
                  <Camera size={24} color={photoFiles[task.id] ? "var(--success-color)" : "var(--text-secondary)"} style={{ margin: '0 auto 0.5rem auto' }}/>
                  <p style={{ color: photoFiles[task.id] ? "var(--success-color)" : "var(--text-secondary)", fontSize: '0.85rem' }}>
                    {photoFiles[task.id] ? photoFiles[task.id]?.name : 'Ketuk untuk pilih foto'}
                  </p>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    if (e.target.files && e.target.files[0]) handlePhotoSelect(task.id, e.target.files[0]);
                  }} />
                </label>
                <button 
                  onClick={() => handleSelesai(task.id, task.report_id)}
                  disabled={isSubmitting[task.id]}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.75rem', opacity: isSubmitting[task.id] ? 0.7 : 1 }}>
                   <CheckCircle2 size={18} /> {isSubmitting[task.id] ? 'Mengunggah & Mengirim...' : 'Selesai & Kirim'}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
        </div>
      )}
    </div>
  );
}