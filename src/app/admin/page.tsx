'use client';
import Map from '@/components/Map';
import { Shield, Layers, LayoutDashboard, Send, MapPin, Activity, BellRing } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const [totalReports, setTotalReports] = useState(0);
  const [topCategory, setTopCategory] = useState('-');
  const [topOpd, setTopOpd] = useState('-');
  const [activities, setActivities] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>Sistem Kendali Aplikasi Lapor Kabupaten Dompu</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-secondary" 
            style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
          >
            <BellRing size={18}/> {activities.length} Notifikasi
            {activities.length > 0 && (
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
                  <div key={i} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--primary-color)' }}>{act.ticket_id}</p>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Laporan baru masuk dari <strong>{act.reporter_name || 'Warga'}</strong></p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(act.created_at).toLocaleString('id-ID')}</p>
                  </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activities.length > 0 ? activities.map((act, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div style={{ width: '10px', height: '10px', background: 'var(--secondary-color)', borderRadius: '50%', marginTop: '6px' }}></div>
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Tiket {act.ticket_id} Masuk</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kategori: {act.categories?.name || '-'}. Keluhan: "{act.complaint?.substring(0, 30)}..."</p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>{new Date(act.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>
            )) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Belum ada aktivitas laporan masuk.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}