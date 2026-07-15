import { BarChart3, Star, Award } from 'lucide-react';
export default function KinerjaBupati() { return (<div style={{padding: '2rem'}}>
  <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}><BarChart3/> Kinerja & Ranking Keluhan OPD</h1>
  <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <th style={{ padding: '1rem 0' }}>Peringkat</th>
          <th style={{ padding: '1rem 0' }}>Nama Instansi OPD</th>
          <th style={{ padding: '1rem 0' }}>Rata-rata Waktu Penanganan</th>
          <th style={{ padding: '1rem 0' }}>Status Evaluasi</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
          <td style={{ padding: '1rem 0' }}><h2 style={{color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap:'0.5rem'}}><Award fill="#fbbf24"/> 1</h2></td>
          <td style={{ padding: '1rem 0' }}><strong>Dinas Kesehatan</strong></td>
          <td style={{ padding: '1rem 0' }}>Kurang dari 2 Jam</td>
          <td style={{ padding: '1rem 0' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>Sangat Memuaskan</span></td>
        </tr>
        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
          <td style={{ padding: '1rem 0' }}><h2 style={{color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap:'0.5rem'}}><Award fill="#94a3b8"/> 2</h2></td>
          <td style={{ padding: '1rem 0' }}><strong>Dinas PUPR</strong></td>
          <td style={{ padding: '1rem 0' }}>Sekitar 4 Jam</td>
          <td style={{ padding: '1rem 0' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>Baik</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>); }