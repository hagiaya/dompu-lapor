'use client';
import Map from '@/components/Map';
import Link from 'next/link';
import { Shield, Layers, LayoutDashboard, Send, MapPin, Activity, BellRing, PieChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [totalReports, setTotalReports] = useState(0);
  const [topCategory, setTopCategory] = useState('-');
  const [topOpd, setTopOpd] = useState('-');
  const [activities, setActivities] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [chartDataKategori, setChartDataKategori] = useState<any>(null);
  const [chartDataKecamatan, setChartDataKecamatan] = useState<any>(null);
  const [chartDataDesa, setChartDataDesa] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch total reports
      const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true });
      setTotalReports(count || 0);

      // Fetch reports with category and OPD
      const { data: reports } = await supabase.from('reports').select(`
        ticket_id, category_id, opd_id, created_at, complaint,
        categories ( name ),
        opds ( name )
      `).order('created_at', { ascending: false }).limit(50);
      
      if (reports && reports.length > 0) {
        // Find top category
        const categoryCount: Record<string, number> = {};
        const opdCount: Record<string, number> = {};
        
        reports.forEach((r: any) => {
          if (r.categories?.name) {
            categoryCount[r.categories.name] = (categoryCount[r.categories.name] || 0) + 1;
          }
          if (r.opds?.name) {
            opdCount[r.opds.name] = (opdCount[r.opds.name] || 0) + 1;
          }
        });

        const sortedCats = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
        if (sortedCats.length > 0) setTopCategory(sortedCats[0][0]);

        const sortedOpds = Object.entries(opdCount).sort((a, b) => b[1] - a[1]);
        if (sortedOpds.length > 0) setTopOpd(sortedOpds[0][0]);

        // Recent 5 activities
        setActivities(reports.slice(0, 5));
        setHasUnread(reports.length > 0);
      }

      // Fetch all reports for stats
      const { data: allReports } = await supabase.from('reports').select(`
        categories ( name ),
        districts ( name ),
        villages ( name )
      `);

      if (allReports) {
        const catCounts: Record<string, number> = {};
        const kecCounts: Record<string, number> = {};
        const desaCounts: Record<string, number> = {};

        allReports.forEach((r: any) => {
           const cat = r.categories?.name || 'Lainnya';
           const kec = r.districts?.name || 'Lainnya';
           const desa = r.villages?.name || 'Lainnya';
           catCounts[cat] = (catCounts[cat] || 0) + 1;
           kecCounts[kec] = (kecCounts[kec] || 0) + 1;
           desaCounts[desa] = (desaCounts[desa] || 0) + 1;
        });
        
        const formatPieData = (counts: Record<string, number>, maxItems = 6) => {
           const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
           const top = sorted.slice(0, maxItems);
           const others = sorted.slice(maxItems).reduce((sum, [, count]) => sum + count, 0);
           if (others > 0) top.push(['Lainnya', others]);
           
           return {
             labels: top.map(item => item[0]),
             datasets: [{
               data: top.map(item => item[1]),
               backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#14b8a6', '#84cc16'],
               borderWidth: 1
             }]
           }
        }

        setChartDataKategori(formatPieData(catCounts));
        setChartDataKecamatan(formatPieData(kecCounts));
        setChartDataDesa(formatPieData(desaCounts, 8));
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh', background: 'var(--background)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'var(--surface)', padding: '1.5rem 2.5rem', borderRadius: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800' }}>
            <Shield size={28} color="var(--secondary-color)" /> Dashboard Admin Utama
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>Sistem Kendali Aplikasi Si<span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>MAJU</span> Kabupaten Dompu</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setHasUnread(false);
            }}
            className="btn-secondary" 
            style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
          >
            <BellRing size={18}/> {activities.length} Notifikasi
            {hasUnread && activities.length > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--error-color)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                {activities.length}
              </span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              width: '320px',
              background: '#fff',
              borderRadius: '1rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--border-color)',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Notifikasi Terbaru
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {activities.length > 0 ? activities.map((act, i) => (
                  <Link href={`/admin/laporan`} key={i} style={{ display: 'block', padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', textDecoration: 'none' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--primary-color)' }}>{act.ticket_id}</p>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Laporan baru masuk dari <strong>{act.reporter_name || 'Warga'}</strong></p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(act.created_at).toLocaleString('id-ID')}</p>
                  </Link>
                )) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Belum ada notifikasi
                  </div>
                )}
              </div>
              <div style={{ padding: '0.75rem', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid var(--border-color)' }}>
                <a href="/admin/laporan" style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>Lihat Semua Laporan</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--secondary-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Total Laporan Masuk</h3>
          <p style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-color)' }}>{totalReports}</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--warning-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Kategori Terpadat</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-color)', marginTop: '0.5rem' }}>{topCategory}</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', borderLeft: '5px solid var(--success-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>OPD Paling Aktif</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-color)', marginTop: '0.5rem' }}>{topOpd}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        {/* Heatmap Area */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
              <MapPin size={22} color="var(--error-color)" /> Peta Heatmap Keluhan
            </h2>
          </div>
          <div style={{ width: '100%', flex: 1, minHeight: '450px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <Map center={[-8.5333, 118.4667]} zoom={12} />
          </div>
        </div>
        
        {/* Aktivitas Terbaru Area */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
            <Activity size={22} color="var(--warning-color)" /> Log Aktivitas Sistem
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.length > 0 ? activities.map(act => (
              <a href={`/admin/laporan?search=${act.ticket_id}`} key={act.ticket_id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', textDecoration: 'none', display: 'block' }} className="hover:bg-gray-50 transition-colors p-2 rounded-lg">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-color)' }}></div>
                  <strong style={{ color: 'var(--primary-color)' }}>Tiket {act.ticket_id} Masuk</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Kategori: {act.categories?.name || '-'}. Keluhan: "{act.complaint?.substring(0, 50)}..."
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  {new Date(act.created_at).toLocaleString('id-ID')}
                </p>
              </a>
            )) : (
              <p style={{ color: 'var(--text-secondary)' }}>Belum ada aktivitas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
        <PieChart size={24} color="var(--secondary-color)" /> Statistik Distribusi Laporan
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '600' }}>Berdasarkan Kategori</h3>
          <div style={{ width: '100%', maxWidth: '300px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {chartDataKategori ? <Pie data={chartDataKategori} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } } } }} /> : <p>Memuat...</p>}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '600' }}>Berdasarkan Kecamatan</h3>
          <div style={{ width: '100%', maxWidth: '300px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {chartDataKecamatan ? <Pie data={chartDataKecamatan} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } } } }} /> : <p>Memuat...</p>}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '600' }}>Berdasarkan Desa (Top 8)</h3>
          <div style={{ width: '100%', maxWidth: '300px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {chartDataDesa ? <Pie data={chartDataDesa} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } } } }} /> : <p>Memuat...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}