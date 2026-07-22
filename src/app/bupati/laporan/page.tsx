'use client';
import { FileText, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LaporanBupati() {
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadMonth, setDownloadMonth] = useState('ALL');
  const [downloadYear, setDownloadYear] = useState(new Date().getFullYear().toString());
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      let query = supabase.from('reports').select(`
        ticket_id, reporter_name, status, created_at,
        categories ( name ),
        opds ( name )
      `).order('created_at', { ascending: false });

      if (downloadYear) {
        const year = parseInt(downloadYear);
        if (downloadMonth === 'ALL') {
          query = query.gte('created_at', `${year}-01-01T00:00:00Z`)
                       .lt('created_at', `${year + 1}-01-01T00:00:00Z`);
        } else {
          const month = parseInt(downloadMonth);
          const nextMonth = month === 12 ? 1 : month + 1;
          const nextYear = month === 12 ? year + 1 : year;
          query = query.gte('created_at', `${year}-${month.toString().padStart(2, '0')}-01T00:00:00Z`)
                       .lt('created_at', `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01T00:00:00Z`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const headers = ['Nomor Tiket', 'Pelapor', 'Kategori', 'Status', 'OPD Penanganan'];
        const csvRows = [headers.join(',')];
        
        for (const r of data) {
          const row: any = r;
          const values = [
            row.ticket_id,
            `"${row.reporter_name}"`,
            `"${row.categories?.name || '-'}"`,
            row.status,
            `"${row.opds?.name || '-'}"`
          ];
          csvRows.push(values.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Laporan_Eksekutif_${downloadMonth === 'ALL' ? 'Tahun' : 'Bulan_' + downloadMonth}_${downloadYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Tidak ada data pada periode tersebut.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh laporan.');
    }
    setIsDownloading(false);
  };

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
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; color: black; }
          aside, button, nav { display: none !important; }
          .glass-panel { 
            box-shadow: none !important; 
            border: 1px solid #ccc !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          main {
            padding: 0 !important;
            overflow: visible !important;
          }
          th { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-header { display: block !important; text-align: center; margin-bottom: 2rem; }
          .no-print { display: none !important; }
        }
        .print-header { display: none; }
      `}} />
      
      <div className="print-header">
        <h2>Pemerintah Kabupaten Dompu</h2>
        <h1>Laporan Eksekutif Rekapitulasi Kinerja Bulanan</h1>
      </div>

      <h1 className="no-print" style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
        <FileText/> Laporan Eksekutif
      </h1>
      <div className="glass-panel" style={{marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center'}}>
          <h2 style={{fontSize: '1.2rem', color: 'var(--text-primary)'}}>Rekapitulasi Kinerja Bulanan Kabupaten Dompu</h2>
          <div className="no-print" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select className="form-input" style={{ padding: '0.5rem', width: 'auto' }} value={downloadMonth} onChange={e => setDownloadMonth(e.target.value)}>
              <option value="ALL">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
            <select className="form-input" style={{ padding: '0.5rem', width: 'auto' }} value={downloadYear} onChange={e => setDownloadYear(e.target.value)}>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <button className="btn-secondary" onClick={handleDownload} disabled={isDownloading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc' }}>
              <Download size={16}/> {isDownloading ? 'Mengunduh...' : 'Unduh CSV'}
            </button>
            <button className="btn-primary" style={{background: 'var(--success-color)'}} onClick={() => window.print()}>
              <Download size={16}/> Cetak PDF
            </button>
          </div>
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