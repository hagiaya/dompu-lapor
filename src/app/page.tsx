'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Activity, Users, MapPin, CheckCircle, Clock } from 'lucide-react';
import Map from '@/components/Map';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LandingPage() {
  const [latestReports, setLatestReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLatestReports() {
      const { data } = await supabase.from('reports')
        .select(`
          id, 
          complaint, 
          status, 
          created_at, 
          categories(name), 
          villages(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (data) {
        setLatestReports(data);
      }
    }
    fetchLatestReports();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.3)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image src="/logo copy.jpeg" alt="SiMAJU Logo" width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary-color)', letterSpacing: '-0.5px' }}>SiMAJU</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" style={{ padding: '0.6rem 1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textDecoration: 'none', borderRadius: '0.5rem', transition: 'all 0.2s ease' }} className="hover:bg-gray-100">
            Masuk Staff
          </Link>
          <Link href="/lapor" style={{ padding: '0.6rem 1.25rem', background: 'var(--primary-color)', color: 'white', fontWeight: '700', textDecoration: 'none', borderRadius: '0.5rem', boxShadow: '0 4px 14px 0 rgba(30, 58, 138, 0.39)', transition: 'all 0.2s ease' }}>
            Buat Laporan
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, padding: '4rem 5%', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {/* Text Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#dbeafe', color: '#1e40af', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 'bold', width: 'fit-content' }}>
              Platform Pengaduan Resmi
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-1px' }}>
              Sistem informasi Masyarakat menuju <span style={{ color: 'var(--success-color)' }}>Dompu Maju</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '90%' }}>
              Wadah penyampaian aspirasi dan keluhan fasilitas publik masyarakat Kabupaten Dompu. Cepat, Mudah, dan Transparan langsung ke instansi terkait.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link href="/lapor" style={{ padding: '1rem 2rem', background: 'var(--primary-color)', color: 'white', fontWeight: '700', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.4)', transition: 'all 0.3s ease' }}>
                Lapor Sekarang <ArrowRight size={20} />
              </Link>
              <Link href="/lapor" style={{ padding: '1rem 2rem', background: 'white', color: 'var(--primary-color)', fontWeight: '700', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', border: '2px solid var(--primary-color)', transition: 'all 0.3s ease' }}>
                Lacak Tiket
              </Link>
            </div>
          </div>

          {/* Feature Image / Graphic */}
          <div style={{ position: 'relative' }}>
             <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'var(--secondary-color)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, zIndex: 0 }}></div>
             <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', background: 'var(--success-color)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.2, zIndex: 0 }}></div>
             
             <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem', transform: 'translateX(-2rem)' }}>
                 <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '1rem', color: '#2563eb' }}><ShieldCheck size={32} /></div>
                 <div>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Resmi & Aman</h3>
                   <p style={{ color: 'var(--text-secondary)' }}>Laporan Anda diteruskan langsung ke sistem Pemerintah Kabupaten Dompu secara aman.</p>
                 </div>
               </div>
               <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem', transform: 'translateX(2rem)' }}>
                 <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '1rem', color: '#16a34a' }}><Activity size={32} /></div>
                 <div>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Pantauan Real-time</h3>
                   <p style={{ color: 'var(--text-secondary)' }}>Lacak progres penanganan laporan Anda dari ponsel kapan saja dan di mana saja.</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>

      {/* Laporan Terbaru (Testimoni Publik) */}
      <section style={{ padding: '5rem 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary-color)', marginBottom: '1rem' }}>Suara Masyarakat Dompu</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Transparansi adalah kunci. Berikut adalah 20 aspirasi masyarakat terbaru yang sedang ditangani oleh instansi terkait.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {latestReports.map((report) => (
              <div key={report.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--secondary-color)', background: '#eff6ff', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
                      {report.categories?.name || 'Umum'}
                    </span>
                    {report.status === 'COMPLETED' ? (
                      <span style={{ color: 'var(--success-color)' }} title="Selesai"><CheckCircle size={20} /></span>
                    ) : (
                      <span style={{ color: 'var(--warning-color)' }} title="Sedang Diproses"><Clock size={20} /></span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-primary)', lineHeight: 1.5, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                    "{report.complaint.length > 120 ? report.complaint.substring(0, 120) + '...' : report.complaint}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <MapPin size={14} /> Desa {report.villages?.name || 'Dompu'}
                </div>
              </div>
            ))}
            {latestReports.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Belum ada laporan terbaru masuk ke dalam sistem.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Peta Persebaran */}
      <section style={{ padding: '5rem 5%', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary-color)', marginBottom: '1rem' }}>Peta Persebaran Keluhan</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Memantau secara visual seluruh titik lokasi masalah dan keluhan yang dilaporkan oleh masyarakat Kabupaten Dompu secara real-time.
            </p>
          </div>
          
          <div style={{ width: '100%', height: '600px', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 }}>
            <Map center={[-8.5333, 118.4667]} zoom={12} />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ padding: '2rem 5%', background: 'var(--primary-color)', color: 'white', textAlign: 'center' }}>
        <p>© 2026 Pemerintah Kabupaten Dompu. Semua Hak Dilindungi.</p>
      </footer>
    </div>
  );
}
