import { FileText, Download } from 'lucide-react';
export default function LaporanBupati() { return (<div style={{padding: '2rem'}}>
  <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}><FileText/> Laporan Eksekutif</h1>
  <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center'}}>
      <h2 style={{fontSize: '1.2rem', color: 'var(--text-primary)'}}>Rekapitulasi Kinerja Bulanan Kabupaten Dompu</h2>
      <button className="btn-primary" style={{background: 'var(--success-color)'}}><Download size={16}/> Cetak PDF Laporan Resmi</button>
    </div>
    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <th style={{ padding: '1rem 0' }}>Bulan</th>
          <th style={{ padding: '1rem 0' }}>Total Laporan Masuk</th>
          <th style={{ padding: '1rem 0' }}>Laporan Selesai</th>
          <th style={{ padding: '1rem 0' }}>Tingkat Kepuasan (SLA)</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
          <td style={{ padding: '1rem 0' }}><strong>Juli 2026</strong></td><td style={{ padding: '1rem 0' }}>128 Aduan</td><td style={{ padding: '1rem 0' }}>93 Diselesaikan</td>
          <td style={{ padding: '1rem 0' }}><span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>72.6% (Sangat Baik)</span></td>
        </tr>
        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
          <td style={{ padding: '1rem 0' }}><strong>Juni 2026</strong></td><td style={{ padding: '1rem 0' }}>310 Aduan</td><td style={{ padding: '1rem 0' }}>295 Diselesaikan</td>
          <td style={{ padding: '1rem 0' }}><span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>95.1% (Sangat Baik)</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>); }