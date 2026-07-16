'use client';
import { BarChart3, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function KinerjaBupati() {
  const [opdRankings, setOpdRankings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      // 1. Ambil semua data OPD
      const { data: opds } = await supabase.from('opds').select('id, name');
      
      // 2. Ambil semua laporan yang sudah di-assign ke OPD
      const { data: reports } = await supabase.from('reports')
        .select('opd_id, status')
        .not('opd_id', 'is', null);

      if (opds && reports) {
        const rankings = opds.map(opd => {
          const opdReports = reports.filter(r => r.opd_id === opd.id);
          const totalAssigned = opdReports.length;
          const totalCompleted = opdReports.filter(r => r.status === 'COMPLETED').length;
          const completionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;
          
          return {
            id: opd.id,
            name: opd.name,
            totalAssigned,
            totalCompleted,
            completionRate
          };
        });

        // Urutkan berdasarkan tingkat penyelesaian tertinggi, lalu jumlah tiket terbanyak
        rankings.sort((a, b) => {
          if (b.completionRate !== a.completionRate) return b.completionRate - a.completionRate;
          return b.totalAssigned - a.totalAssigned;
        });

        setOpdRankings(rankings);
      }
      setIsLoading(false);
    }
    
    fetchRankings();
  }, []);

  const getEvaluationStatus = (rate: number, totalAssigned: number) => {
    if (totalAssigned === 0) return { label: 'Belum Ada Tugas', bg: '#f1f5f9', color: '#64748b' };
    if (rate >= 80) return { label: 'Sangat Memuaskan', bg: '#dcfce7', color: '#166534' };
    if (rate >= 50) return { label: 'Baik', bg: '#fef3c7', color: '#b45309' };
    return { label: 'Perlu Evaluasi', bg: '#fee2e2', color: '#b91c1c' };
  };

  const getRankColor = (index: number) => {
    if (index === 0) return '#fbbf24'; // Emas
    if (index === 1) return '#94a3b8'; // Perak
    if (index === 2) return '#b45309'; // Perunggu
    return 'var(--text-secondary)';
  };

  return (
    <div style={{padding: '2rem'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
        <BarChart3/> Kinerja & Ranking Keluhan OPD
      </h1>
      <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 0' }}>Peringkat</th>
              <th style={{ padding: '1rem 0' }}>Nama Instansi OPD</th>
              <th style={{ padding: '1rem 0' }}>Tingkat Penyelesaian</th>
              <th style={{ padding: '1rem 0' }}>Status Evaluasi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Menghitung skor kinerja...</td>
              </tr>
            ) : opdRankings.length > 0 ? (
              opdRankings.map((opd, index) => {
                const evalStatus = getEvaluationStatus(opd.completionRate, opd.totalAssigned);
                return (
                  <tr key={opd.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0' }}>
                      <h2 style={{color: getRankColor(index), margin: 0, display: 'flex', alignItems: 'center', gap:'0.5rem'}}>
                        {index < 3 && <Award fill={getRankColor(index)}/>} 
                        {index + 1}
                      </h2>
                    </td>
                    <td style={{ padding: '1rem 0' }}><strong>{opd.name}</strong></td>
                    <td style={{ padding: '1rem 0' }}>
                      {opd.completionRate.toFixed(1)}% <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({opd.totalCompleted}/{opd.totalAssigned} Selesai)</span>
                    </td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ background: evalStatus.bg, color: evalStatus.color, padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {evalStatus.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada data OPD yang dievaluasi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  ); 
}