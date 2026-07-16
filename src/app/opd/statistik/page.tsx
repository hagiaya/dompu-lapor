'use client';
import { TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StatistikOPD() {
  const [loading, setLoading] = useState(true);
  const [totalMasuk, setTotalMasuk] = useState(0);
  const [totalSelesai, setTotalSelesai] = useState(0);
  const [avgResponseTimeStr, setAvgResponseTimeStr] = useState('0 Jam');
  const [avgResponseTimeDiff, setAvgResponseTimeDiff] = useState('');
  
  // Data chart statis/default jika belum ada data
  const [masukBulanan, setMasukBulanan] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0]);
  const [selesaiBulanan, setSelesaiBulanan] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0]);
  const [weeklyResponseData, setWeeklyResponseData] = useState<number[]>([0,0,0,0]);

  useEffect(() => {
    async function fetchData() {
      // 1. Dapatkan OPD yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      let currentOpdId = null;
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('opd_id').eq('id', user.id).single();
        if (profile) currentOpdId = profile.opd_id;
      }

      // 2. Fetch semua report tahun ini
      const currentYear = new Date().getFullYear();
      let query = supabase.from('reports').select('id, status, created_at, report_progress(created_at)').gte('created_at', `${currentYear}-01-01T00:00:00Z`);
      if (currentOpdId) {
        query = query.eq('opd_id', currentOpdId);
      }
      
      const { data: reports } = await query;
      
      if (reports) {
        setTotalMasuk(reports.length);
        
        const selesai = reports.filter(r => r.status === 'COMPLETED');
        setTotalSelesai(selesai.length);

        const mBln = [0,0,0,0,0,0,0,0,0,0,0,0];
        const sBln = [0,0,0,0,0,0,0,0,0,0,0,0];
        
        let totalResponseHours = 0;
        let respondedCount = 0;
        const weeklyResponses = [0,0,0,0]; // 4 minggu dalam bulan berjalan
        const weeklyCounts = [0,0,0,0];
        const currentMonth = new Date().getMonth();

        reports.forEach(r => {
          const reportDate = new Date(r.created_at);
          const m = reportDate.getMonth();
          mBln[m] += 1;
          if (r.status === 'COMPLETED') {
            sBln[m] += 1;
          }

          // Hitung waktu respons jika ada progress
          if (r.report_progress && r.report_progress.length > 0) {
            // Cari progress pertama
            const firstProgress = r.report_progress.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
            const diffHours = (new Date(firstProgress.created_at).getTime() - reportDate.getTime()) / (1000 * 60 * 60);
            
            totalResponseHours += diffHours;
            respondedCount++;

            // Masukkan ke statistik mingguan jika laporan di bulan ini
            if (m === currentMonth) {
              const date = reportDate.getDate();
              const week = Math.min(Math.floor((date - 1) / 7), 3); // 0, 1, 2, 3
              weeklyResponses[week] += diffHours;
              weeklyCounts[week] += 1;
            }
          }
        });

        setMasukBulanan(mBln);
        setSelesaiBulanan(sBln);

        if (respondedCount > 0) {
          const avg = totalResponseHours / respondedCount;
          setAvgResponseTimeStr(`${avg.toFixed(1)} Jam`);
        } else {
          setAvgResponseTimeStr('0 Jam');
        }

        const avgWeekly = weeklyResponses.map((total, i) => weeklyCounts[i] > 0 ? Number((total / weeklyCounts[i]).toFixed(1)) : 0);
        setWeeklyResponseData(avgWeekly);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

  const lineChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Laporan Diselesaikan',
        data: selesaiBulanan,
        borderColor: 'rgb(16, 185, 129)', // success-color
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Laporan Masuk',
        data: masukBulanan,
        borderColor: 'rgb(59, 130, 246)', // primary-color
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        borderDash: [5, 5],
      }
    ],
  };

  const barChartData = {
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
    datasets: [
      {
        label: 'Rata-rata Waktu Respons (Jam)',
        data: weeklyResponseData,
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // warning-color
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const completionRate = totalMasuk > 0 ? ((totalSelesai / totalMasuk) * 100).toFixed(1) : '0.0';

  return (
    <div style={{padding: '2.5rem', minHeight: '100vh', background: 'var(--background)'}}>
      <h1 style={{fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)', marginBottom: '2.5rem', fontWeight: '800'}}>
        <TrendingUp size={28} color="var(--secondary-color)"/> Statistik Kinerja & Penyelesaian
      </h1>

      {loading ? (
         <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat statistik...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--success-color)' }}>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Tingkat Penyelesaian (SLA)</p>
               <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: '0.5rem 0', fontWeight: '900' }}>{completionRate}%</h2>
               <p style={{ color: 'var(--success-color)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}><TrendingUp size={14}/> Dari {totalMasuk} laporan</p>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--warning-color)' }}>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Rata-rata Waktu Respons</p>
               <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: '0.5rem 0', fontWeight: '900' }}>{avgResponseTimeStr}</h2>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}><TrendingUp size={14}/> Dihitung dari log progres</p>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--secondary-color)' }}>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Total Diselesaikan (Tahun Ini)</p>
               <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: '0.5rem 0', fontWeight: '900' }}>{totalSelesai}</h2>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>Dari total {totalMasuk} laporan masuk</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
            {/* Line Chart */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                 <CheckCircle size={20} color="var(--success-color)"/> Tren Penyelesaian Laporan per Bulan
              </h3>
              <div style={{ height: '350px' }}>
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </div>

            {/* Bar Chart */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                 <Clock size={20} color="var(--warning-color)"/> Evaluasi Waktu Respons
              </h3>
              <div style={{ height: '350px' }}>
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}