import { Users, Plus, Edit, Trash2 } from 'lucide-react';
export default function OPDAdmin() { return (<div style={{padding: '2rem'}}>
  <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}><Users/> Manajemen Data OPD</h1>
  <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
    <button className="btn-primary" style={{marginBottom: '1.5rem'}}><Plus size={16}/> Daftarkan OPD Baru</button>
    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <th style={{ padding: '1rem 0' }}>Nama OPD</th>
          <th style={{ padding: '1rem 0' }}>Kepala Dinas</th>
          <th style={{ padding: '1rem 0' }}>Kontak (WhatsApp)</th>
          <th style={{ padding: '1rem 0' }}>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {['Dinas PUPR', 'Dinas Kesehatan', 'Dinas Pendidikan', 'Dinas Lingkungan Hidup'].map((opd, i) => (
        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
          <td style={{ padding: '1rem 0' }}><strong>{opd}</strong></td>
          <td style={{ padding: '1rem 0' }}>Dr. Ir. Pejabat Daerah, MT</td>
          <td style={{ padding: '1rem 0' }}>08123456789{i}</td>
          <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{padding: '0.5rem', color: 'var(--secondary-color)'}}><Edit size={16}/></button>
            <button className="btn-secondary" style={{padding: '0.5rem', color: 'var(--error-color)'}}><Trash2 size={16}/></button>
          </td>
        </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>); }