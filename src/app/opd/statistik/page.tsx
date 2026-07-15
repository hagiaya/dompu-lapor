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
  
  // Data chart statis/default jika belum ada data
  const [masukBulanan, setMasukBulanan] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0]);
  const [selesaiBulanan, setSelesaiBulanan] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0]);

  useEffect(() => {
    async function fetchData() {
      // Kita fetch semua report tahun ini untuk simplicity
      const currentYear = new Date().getFullYear();
      const { data: reports } = await supabase.from('reports').select('id, status, created_at')
        .gte('created_at', `${currentYear}-01-01T00:00:00Z`);
      
      if (reports) {
        setTotalMasuk(reports.length);
        
        const selesai = reports.filter(r => r.status === 'COMPLETED');
        setTotalSelesai(selesai.length);

        const mBln = [0,0,0,0,0,0,0,0,0,0,0,0];
        const sBln = [0,0,0,0,0,0,0,0,0,0,0,0];

        reports.forEach(r => {
          const m = new Date(r.created_at).getMonth();
          mBln[m] += 1;
          if (r.status === 'COMPLETED') {
            sBln[m] += 1;
          }
        });

        setMasukBulanan(mBln);
        setSelesaiBulanan(sBln);
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
        data: [4.2, 3.8, 3.1, 2.5], // Tetap mock untuk sementara
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
               <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: '0.5rem 0', fontWeight: '900' }}>2.5 Jam</h2>
               <p style={{ color: 'var(--success-color)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}><TrendingUp size={14}/> Lebih cepat 30 menit</p>
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