'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Activity, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', display: 'flex', flexDirection: 'column' }}>
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
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '4rem 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          
          {/* Text Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#dbeafe', color: '#1e40af', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 'bold', width: 'fit-content' }}>
              Platform Pengaduan Resmi
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-1px' }}>
              Sistem Informasi Masyarakat menuju <span style={{ color: 'var(--success-color)' }}>Dompu Maju</span>
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

               <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem', transform: 'translateX(-1rem)' }}>
                 <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '1rem', color: '#dc2626' }}><Users size={32} /></div>
                 <div>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Respon Cepat</h3>
                   <p style={{ color: 'var(--text-secondary)' }}>Disposisi otomatis ke Organisasi Perangkat Daerah (OPD) terkait untuk penanganan sigap.</p>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
