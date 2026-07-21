'use client';
import Map from '@/components/Map';
import { ShieldCheck, Activity, FileText, CheckCircle, Clock, AlertOctagon, Megaphone, PieChart, BarChart3, TrendingUp, Users, TableProperties } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Filler } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import Link from 'next/link';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Filler);

export default function BupatiDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0
  });
  const [urgentReport, setUrgentReport] = useState<any>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Chart States
  const [chartDataKategori, setChartDataKategori] = useState<any>(null);
  const [chartDataKinerja, setChartDataKinerja] = useState<any>(null);
  const [chartDataTrend, setChartDataTrend] = useState<any>(null);
  const [chartDataUsia, setChartDataUsia] = useState<any>(null);
  const [chartDataGender, setChartDataGender] = useState<any>(null);
  const [chartDataStatus, setChartDataStatus] = useState<any>(null);

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);
    
    const { error } = await supabase.from('broadcasts').insert([{ message: broadcastMessage }]);
    
    setIsSendingBroadcast(false);
    if (!error) {
      alert('Instruksi berhasil dikirim ke seluruh OPD!');
      setBroadcastMessage('');
    } else {
      alert('Gagal mengirim instruksi: ' + error.message);
    }
  };

  useEffect(() => {
    async function fetchStats() {
      // 1. Fetch Summary Counts
      const { count: totalCount } = await supabase.from('reports').select('*', { count: 'exact', head: true });
      const { count: inProgressCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).in('status', ['ACCEPTED', 'IN_PROGRESS']);
      const { count: completedCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED');

      setStats({
        total: totalCount || 0,
        inProgress: inProgressCount || 0,
        completed: completedCount || 0
      });

      // 2. Fetch Urgent Report
      const { data: urgentData } = await supabase.from('reports')
        .select('complaint, status, ticket_id, categories(name), villages(name)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (urgentData) {
        setUrgentReport(urgentData);
      }

      // 3. Fetch comprehensive reports for Charts and Table
      const { data: allReports } = await supabase.from('reports').select(`
        created_at, status, ticket_id, complaint, reporter_name,
        categories ( name ),
        opds ( name )
      `).order('created_at', { ascending: false });

      if (allReports) {
        // Recent 5 for table
        setRecentReports(allReports.slice(0, 5));

        const catCounts: Record<string, number> = {};
        const opdCounts: Record<string, { total: number, completed: number }> = {};
        const dateCounts: Record<string, number> = {};
        let pending = 0, accepted = 0, inProgress = 0, completed = 0, rejected = 0;

        allReports.forEach((r: any) => {
          // Status
          if (r.status === 'PENDING') pending++;
          else if (r.status === 'ACCEPTED') accepted++;
          else if (r.status === 'IN_PROGRESS') inProgress++;
          else if (r.status === 'COMPLETED') completed++;
          else if (r.status === 'REJECTED') rejected++;

          // Category
          const cat = r.categories?.name || 'Lainnya';
          catCounts[cat] = (catCounts[cat] || 0) + 1;

          // OPD
          if (r.opds?.name) {
            const opd = r.opds.name;
            if (!opdCounts[opd]) opdCounts[opd] = { total: 0, completed: 0 };
            opdCounts[opd].total += 1;
            if (r.status === 'COMPLETED') opdCounts[opd].completed += 1;
          }

          // Trend
          const date = new Date(r.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        });

        // Setup Kategori Pie Chart
        const sortedCats = Object.entries(catCounts).sort((a,b) => b[1] - a[1]);
        const topCats = sortedCats.slice(0, 5);
        setChartDataKategori({
          labels: topCats.map(c => c[0]),
          datasets: [{
            data: topCats.map(c => c[1]),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 1
          }]
        });

        // Setup OPD Bar Chart
        const sortedOpds = Object.entries(opdCounts).sort((a,b) => b[1].total - a[1].total).slice(0, 6);
        setChartDataKinerja({
          labels: sortedOpds.map(o => o[0].length > 15 ? o[0].substring(0, 15) + '...' : o[0]),
          datasets: [
            {
              label: 'Selesai',
              data: sortedOpds.map(o => o[1].completed),
              backgroundColor: '#10b981',
              borderRadius: 4
            },
            {
              label: 'Total Ditugaskan',
              data: sortedOpds.map(o => o[1].total),
              backgroundColor: '#94a3b8',
              borderRadius: 4
            }
          ]
        });

        // Setup Status Doughnut
        setChartDataStatus({
          labels: ['Pending', 'Diterima OPD', 'Dikerjakan', 'Selesai', 'Ditolak'],
          datasets: [{
            data: [pending, accepted, inProgress, completed, rejected],
            backgroundColor: ['#64748b', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
            borderWidth: 1
          }]
        });

        // Setup Trend Line Chart
        // Limit to latest 7 days
        const dates = Object.keys(dateCounts).reverse().slice(0, 7).reverse();
        setChartDataTrend({
          labels: dates,
          datasets: [{
            label: 'Laporan Masuk',
            data: dates.map(d => dateCounts[d]),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        });

        // Setup Mock Demografi Gender (Informasi simulasi karena database belum mendata ini)
        setChartDataGender({
          labels: ['Laki-laki (Mock)', 'Perempuan (Mock)'],
          datasets: [{
            data: [62, 38], 
            backgroundColor: ['#3b82f6', '#ec4899'],
            borderWidth: 0
          }]
        });

        // Setup Mock Demografi Usia
        setChartDataUsia({
          labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
          datasets: [{
            label: 'Persentase Pelapor (%)',
            data: [15, 42, 23, 12, 8], 
            backgroundColor: '#8b5cf6',
            borderRadius: 4
          }]
        });
      }
    }
    
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Menunggu</span>;
      case 'ACCEPTED': return <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Diterima OPD</span>;
      case 'IN_PROGRESS': return <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Dikerjakan</span>;
      case 'COMPLETED': return <span style={{ background: '#ecfdf5', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Selesai</span>;
      case 'REJECTED': return <span style={{ background: '#fef2f2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Ditolak</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'var(--background)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'var(--surface)', padding: '1.5rem 2.5rem', borderRadius: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', fontWeight: '800' }}>
            <ShieldCheck size={32} color="var(--secondary-color)" /> Pusat Komando Bupati
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Dashboard Eksekutif SiMAJU - Pemantauan Komprehensif Kabupaten Dompu</p>
        </div>
      </header>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Laporan Masuk</h3>
            <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.total}</p>
          </div>
          <FileText size={56} color="var(--secondary-color)" style={{ opacity: 0.1 }} />
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--warning-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sedang Dikerjakan OPD</h3>
            <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.inProgress}</p>
          </div>
          <Clock size={56} color="var(--warning-color)" style={{ opacity: 0.1 }} />
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Laporan Diselesaikan</h3>
            <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.completed}</p>
          </div>
          <CheckCircle size={56} color="var(--success-color)" style={{ opacity: 0.1 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', marginBottom: '2.5rem' }}>
        {/* Peta Interaktif Besar */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)' }}>
              <Activity size={24} color="var(--error-color)" /> Pantauan Peta Wilayah Real-time
            </h2>
          </div>
          <div style={{ width: '100%', height: '400px', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            <Map center={[-8.5333, 118.4667]} zoom={12} />
          </div>
        </div>
        
        {/* Isu Urgent & Tindakan Eksekutif */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', background: '#fff1f2', border: '1px solid #fecdd3' }}>
             <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#be123c', marginBottom: '1rem' }}>
              <AlertOctagon size={20} /> Isu Paling Mendesak
            </h2>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '0.75rem' }}>
              {urgentReport ? (
                <>
                  <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{urgentReport.categories?.name || 'Keluhan Umum'} di {urgentReport.villages?.name || 'Dompu'}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Tiket: {urgentReport.ticket_id}. Keluhan: "{urgentReport.complaint?.substring(0, 50)}..."</p>
                  <Link href={`/admin/laporan?search=${urgentReport.ticket_id}`} style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'underline' }}>
                    Lihat Detail Penuh
                  </Link>
                </>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Belum ada laporan mendesak saat ini.</p>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
             <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
              <Megaphone size={20} color="var(--secondary-color)" /> Pesan Broadcast Eksekutif
            </h2>
            <textarea 
              className="form-input" 
              rows={4} 
              placeholder="Kirim instruksi khusus ke seluruh Kepala OPD secara instan..." 
              style={{ flex: 1, marginBottom: '1rem', resize: 'none' }}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              disabled={isSendingBroadcast}
            ></textarea>
            <button 
              className="btn-primary" 
              style={{ width: '100%' }}
              onClick={handleSendBroadcast}
              disabled={isSendingBroadcast || !broadcastMessage.trim()}
            >
              {isSendingBroadcast ? 'Mengirim...' : 'Kirim Instruksi Khusus'}
            </button>
          </div>
        </div>
      </div>

      {/* Row: Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
            <TrendingUp size={18} /> Tren Laporan Masuk (7 Hari)
          </h2>
          <div style={{ height: '220px', width: '100%' }}>
            {chartDataTrend ? <Line data={chartDataTrend} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /> : <p>Memuat...</p>}
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
            <BarChart3 size={18} /> Kinerja Respons OPD Top 6
          </h2>
          <div style={{ height: '220px', width: '100%' }}>
            {chartDataKinerja ? <Bar data={chartDataKinerja} options={{ maintainAspectRatio: false }} /> : <p>Memuat...</p>}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
            <PieChart size={18} /> Status Penanganan Keseluruhan
          </h2>
          <div style={{ height: '220px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {chartDataStatus ? <Doughnut data={chartDataStatus} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } } }} /> : <p>Memuat...</p>}
          </div>
        </div>
      </div>

      {/* Row: Demografi Data & Kategori */}
      <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)', marginBottom: '1.5rem', marginTop: '3.5rem' }}>
        <Users size={24} color="var(--secondary-color)" /> Demografi & Kategori (Infografis)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Top 5 Kategori Laporan</h3>
          <div style={{ height: '200px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {chartDataKategori ? <Pie data={chartDataKategori} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} /> : <p>Memuat...</p>}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Distribusi Gender (Visualisasi)</h3>
          <div style={{ height: '200px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {chartDataGender ? <Doughnut data={chartDataGender} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} /> : <p>Memuat...</p>}
          </div>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>*Data simulasi representatif demografi dompu</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>Rentang Usia Pelapor</h3>
          <div style={{ height: '200px', width: '100%' }}>
            {chartDataUsia ? <Bar data={chartDataUsia} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /> : <p>Memuat...</p>}
          </div>
        </div>
      </div>

      {/* Laporan Terbaru Data Table */}
      <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)', marginBottom: '1.5rem', marginTop: '3.5rem' }}>
        <TableProperties size={24} color="var(--warning-color)" /> Data Laporan Terbaru
      </h2>
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tiket & Tanggal</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nama Pelapor</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Keluhan Utama</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Kategori / OPD Terkait</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map(report => (
              <tr key={report.ticket_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{report.ticket_id}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(report.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.95rem' }}>{report.reporter_name || 'Hamba Allah'}</td>
                <td style={{ padding: '1rem', fontSize: '0.95rem', maxWidth: '300px' }}>{report.complaint?.length > 40 ? report.complaint.substring(0, 40) + '...' : report.complaint}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                  <div>{report.categories?.name || '-'}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{report.opds?.name || 'Belum Ditugaskan OPD'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {getStatusBadge(report.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentReports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Tidak ada laporan.</div>
        )}
      </div>

    </div>
  );
}