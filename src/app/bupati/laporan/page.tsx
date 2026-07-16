'use client';
import { FileText, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LaporanBupati() {
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMonthlyStats() {
      const { data, error } = await supabase.from('reports').select('created_at, status');
      
      if (data) {
        // Kelompokkan berdasarkan bulan dan tahun
        const statsMap: Record<string, { total: number, completed: number, dateKey: Date }> = {};
        
        data.forEach(report => {
          const date = new Date(report.created_at);
          const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          
          if (!statsMap[monthYear]) {
            statsMap[monthYear] = { total: 0, completed: 0, dateKey: new Date(date.getFullYear(), date.getMonth(), 1) };
          }
          
          statsMap[monthYear].total += 1;
          if (report.status === 'COMPLETED') {
            statsMap[monthYear].completed += 1;
          }
        });

        // Konversi ke array dan urutkan dari bulan terbaru
        const statsArray = Object.keys(statsMap).map(key => ({
          month: key,
          total: statsMap[key].total,
          completed: statsMap[key].completed,
          dateKey: statsMap[key].dateKey,
          completionRate: statsMap[key].total > 0 ? (statsMap[key].completed / statsMap[key].total) * 100 : 0
        })).sort((a, b) => b.dateKey.getTime() - a.dateKey.getTime());
        
        setMonthlyStats(statsArray);
      }
      setIsLoading(false);
    }
    
    fetchMonthlyStats();
  }, []);

  const getSlaColor = (rate: number) => {
    if (rate >= 80) return 'var(--success-color)';
    if (rate >= 50) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  const getSlaText = (rate: number) => {
    if (rate >= 80) return 'Sangat Baik';
    if (rate >= 50) return 'Cukup';
    return 'Perlu Perhatian';
  };

  return (
    <div style={{padding: '2rem'}}>
      <h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
        <FileText/> Laporan Eksekutif
      </h1>
      <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center'}}>
          <h2 style={{fontSize: '1.2rem', color: 'var(--text-primary)'}}>Rekapitulasi Kinerja Bulanan Kabupaten Dompu</h2>
          <button className="btn-primary" style={{background: 'var(--success-color)'}} onClick={() => alert('Fitur cetak PDF akan segera hadir!')}>
            <Download size={16}/> Cetak PDF Laporan Resmi
          </button>
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
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data kinerja...</td>
              </tr>
            ) : monthlyStats.length > 0 ? (
              monthlyStats.map((stat, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0' }}><strong>{stat.month}</strong></td>
                  <td style={{ padding: '1rem 0' }}>{stat.total} Aduan</td>
                  <td style={{ padding: '1rem 0' }}>{stat.completed} Diselesaikan</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ color: getSlaColor(stat.completionRate), fontWeight: 'bold' }}>
                      {stat.completionRate.toFixed(1)}% ({getSlaText(stat.completionRate)})
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada data laporan masuk.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  ); 
}