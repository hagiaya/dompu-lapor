'use client';
import Map from '@/components/Map';
import { ShieldCheck, Activity, FileText, CheckCircle, Clock, AlertOctagon, Megaphone } from 'lucide-react';

export default function BupatiDashboard() {
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
            <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>128</p>
          </div>
          <FileText size={56} color="var(--secondary-color)" style={{ opacity: 0.1 }} />
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--warning-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sedang Dikerjakan OPD</h3>
            <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>35</p>
          </div>
          <Clock size={56} color="var(--warning-color)" style={{ opacity: 0.1 }} />
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Laporan Diselesaikan</h3>
            <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>93</p>
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
               <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Jembatan Putus di Desa Hu'u</p>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Terlapor 5x hari ini. Status: Menunggu penanganan PUPR.</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
             <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
              <Megaphone size={20} color="var(--secondary-color)" /> Pesan Broadcast Eksekutif
            </h2>
            <textarea className="form-input" rows={4} placeholder="Kirim instruksi khusus ke seluruh Kepala OPD secara instan..." style={{ marginBottom: '1rem' }}></textarea>
            <button className="btn-primary" style={{ width: '100%' }}>Kirim Instruksi</button>
          </div>
        </div>
      </div>
    </div>
  );
}