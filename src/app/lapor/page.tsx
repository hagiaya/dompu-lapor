'use client';
import { useState, useEffect } from 'react';
import { MessageSquarePlus, Search, Send, MapPin, User, Phone, CheckCircle, Shield, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Camera } from 'lucide-react';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div style={{ height: '250px', background: '#e2e8f0', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Memuat Peta...</div>
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'buat' | 'cek'>('buat');
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [villages, setVillages] = useState<{ id: string; district_id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [totalAduan, setTotalAduan] = useState(0);
  const [persenSelesai, setPersenSelesai] = useState(0);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    
    const formData = new FormData(e.currentTarget);
    const generatedTicket = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let uploadedPhotoUrl = null;
    
    if (photoFile) {
      const imgFormData = new FormData();
      imgFormData.append('image', photoFile);
      
      try {
        const res = await fetch(`/api/upload`, {
          method: 'POST',
          body: imgFormData
        });
        const data = await res.json();
        if (data.success) {
          uploadedPhotoUrl = data.url;
        } else {
          console.error("Upload failed", data.error);
        }
      } catch (err) {
        console.error("Upload error", err);
      }
    }

    const { error } = await supabase.from('reports').insert({
      ticket_id: generatedTicket,
      reporter_name: formData.get('reporter_name'),
      reporter_wa: formData.get('reporter_wa'),
      district_id: formData.get('district_id'),
      village_id: formData.get('village_id'),
      category_id: formData.get('category_id'),
      complaint: formData.get('complaint'),
      lat: location?.lat,
      lng: location?.lng,
      photo_url: uploadedPhotoUrl
    });
    
    setIsSubmitting(false);
    
    if (error) {
      setSubmitMessage('Gagal mengirim laporan. Coba lagi.');
      console.error(error);
    } else {
      setTicketId(generatedTicket);
      setSubmitMessage('Laporan berhasil dikirim!');
      (e.target as HTMLFormElement).reset();
      setSelectedDistrict('');
      setLocation(null);
      setPhotoFile(null);
    }
  };

  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);
    
    const formData = new FormData(e.currentTarget);
    const searchTicketId = formData.get('search_ticket') as string;
    
    const { data, error } = await supabase
      .from('reports')
      .select('status, complaint, created_at, photo_url, report_progress(status, created_at, evidence_url)')
      .eq('ticket_id', searchTicketId)
      .single();
      
    setIsSearching(false);
    
    if (error || !data) {
      setSearchError('Tiket tidak ditemukan. Periksa kembali kode Anda.');
    } else {
      setSearchResult(data);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: dData } = await supabase.from('districts').select('*');
      if (dData) setDistricts(dData);
      
      const { data: vData } = await supabase.from('villages').select('*');
      if (vData) setVillages(vData);
      
      const { data: cData } = await supabase.from('categories').select('*');
      if (cData) setCategories(cData);
      
      const { data: rData } = await supabase.from('reports').select('status');
      if (rData) {
        setTotalAduan(rData.length);
        const selesai = rData.filter((r: any) => r.status === 'COMPLETED').length;
        setPersenSelesai(rData.length > 0 ? (selesai / rData.length) * 100 : 0);
      }
    };
    fetchData();
  }, []);

  const filteredVillages = villages.filter(v => v.district_id === selectedDistrict);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', justifyContent: 'center', padding: '0' }}>
      {/* Responsive Container */}
      <div style={{ width: '100%', maxWidth: '700px', background: 'var(--background)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 0 20px rgba(0,0,0,0.05)', minHeight: '100vh' }}>
        {/* Header / Top Bar */}
        <header style={{ padding: '1.25rem 1.5rem', background: 'var(--surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ color: 'var(--primary-color)', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image src="/logo copy.jpeg" alt="SiMAJU Logo" width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            SiMAJU
          </h2>
          <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Masuk Staff
          </Link>
        </header>

        {/* Scrollable Content */}
        <main style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.75rem', color: 'var(--primary-color)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
              Sistem Informasi Masyarakat <br /> menuju <span style={{ color: 'var(--secondary-color)' }}>Dompu Maju</span>
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '1rem', fontWeight: '600' }}>
              Lapor Cepat, DOMPU HEBAT
            </p>
          </div>

          <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', marginBottom: '3rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <button 
                onClick={() => setActiveTab('buat')}
                style={{ flex: 1, padding: '1rem 0.5rem', background: activeTab === 'buat' ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', borderBottom: activeTab === 'buat' ? '3px solid var(--secondary-color)' : '3px solid transparent', color: activeTab === 'buat' ? 'var(--secondary-color)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <MessageSquarePlus size={18} /> Aduan Baru
              </button>
              <button 
                onClick={() => setActiveTab('cek')}
                style={{ flex: 1, padding: '1rem 0.5rem', background: activeTab === 'cek' ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', borderBottom: activeTab === 'cek' ? '3px solid var(--secondary-color)' : '3px solid transparent', color: activeTab === 'cek' ? 'var(--secondary-color)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <Search size={18} /> Lacak Tiket
              </button>
            </div>

            <div style={{ padding: '1.5rem', background: '#ffffff' }}>
              {activeTab === 'buat' ? (
                ticketId ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                    <div style={{ padding: '2rem', background: '#dcfce7', color: '#166534', borderRadius: '1rem', marginBottom: '1.5rem', border: '1px solid #bbf7d0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <CheckCircle size={56} style={{ margin: '0 auto 1rem auto', color: '#15803d' }} />
                      <p style={{ fontWeight: '900', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Berhasil Dikirim!</p>
                      <p style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Kode Tiket Anda:</p>
                      <strong style={{ fontSize: '2rem', letterSpacing: '2px', display: 'block', margin: '0.5rem 0', color: '#166534' }}>{ticketId}</strong>
                      <p style={{ fontSize: '0.95rem', marginTop: '1.5rem', fontWeight: '500' }}>Simpan kode ini untuk melacak laporan Anda.</p>
                    </div>
                    <button onClick={() => setTicketId('')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem', borderRadius: '0.75rem', fontWeight: 'bold' }}>
                      Kirim Laporan Lainnya
                    </button>
                  </div>
                ) : (
                <form onSubmit={handleSubmit}>
                  {submitMessage && !ticketId && (
                    <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
                      <p>{submitMessage}</p>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> Nama Lengkap</label>
                      <input type="text" name="reporter_name" className="form-input" placeholder="Sesuai KTP" required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} /> WhatsApp Aktif</label>
                      <input type="tel" name="reporter_wa" className="form-input" placeholder="08..." required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Kecamatan</label>
                      <select name="district_id" className="form-input" required value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                        <option value="" disabled>Pilih Kecamatan...</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Desa / Kelurahan</label>
                      <select name="village_id" className="form-input" required defaultValue="">
                        <option value="" disabled>Pilih Desa...</option>
                        {filteredVillages.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select name="category_id" className="form-input" required defaultValue="">
                      <option value="" disabled>Pilih Kategori...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Detail Keluhan & Lokasi</label>
                    <textarea name="complaint" className="form-input" rows={4} placeholder="Ceritakan masalah dan patokan lokasinya..." required></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tandai Lokasi Peta (Opsional)</label>
                    <MapPicker onLocationSelect={(lat, lng) => setLocation({lat, lng})} />
                    {location && <p style={{ fontSize: '0.75rem', color: 'var(--success-color)', marginTop: '0.25rem' }}>Lokasi tersimpan: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Foto Bukti (Opsional)</label>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '0.75rem', background: '#f8fafc', cursor: 'pointer' }}>
                      <Camera size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{photoFile ? photoFile.name : 'Ketuk untuk mengambil foto'}</span>
                      <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPhotoFile(e.target.files[0]);
                        }
                      }} />
                    </label>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.5rem', borderRadius: '0.75rem', fontWeight: 'bold', opacity: isSubmitting ? 0.7 : 1 }}>
                    <Send size={18} /> {isSubmitting ? 'Mengirim...' : 'Kirim Sekarang'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.4 }}>Notifikasi akan dikirim otomatis ke WA Anda.</p>
                </form>
                )
              ) : (
                <form onSubmit={handleSearch} style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <Search size={40} color="var(--text-secondary)" style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Lacak Progres Laporan</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.4 }}>Masukkan kode tiket dari WhatsApp.</p>
                  <div className="form-group">
                    <input type="text" name="search_ticket" className="form-input" placeholder="TKT-XXXX" style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '2px', padding: '0.85rem' }} required />
                  </div>
                  <button type="submit" disabled={isSearching} className="btn-secondary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '0.75rem' }}>
                     {isSearching ? 'Mencari...' : 'Lacak Sekarang'}
                  </button>
                  
                  {searchResult && (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '1rem', textAlign: 'left', background: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Status Terkini</p>
                       <h4 style={{ fontSize: '1.3rem', color: 'var(--primary-color)', marginBottom: '0.25rem', marginTop: '0.25rem' }}>{searchResult.status}</h4>
                       <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>"{searchResult.complaint}"</p>
                       
                       {/* Timeline Progress Bar */}
                       <div style={{ marginBottom: '2rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                           <span style={{ color: ['PENDING', 'DISPOSISI', 'IN_PROGRESS', 'COMPLETED'].includes(searchResult.status) ? 'var(--primary-color)' : '' }}>Terkirim</span>
                           <span style={{ color: ['DISPOSISI', 'IN_PROGRESS', 'COMPLETED'].includes(searchResult.status) ? 'var(--primary-color)' : '' }}>Diteruskan</span>
                           <span style={{ color: ['IN_PROGRESS', 'COMPLETED'].includes(searchResult.status) ? 'var(--primary-color)' : '' }}>Dikerjakan</span>
                           <span style={{ color: searchResult.status === 'COMPLETED' ? 'var(--success-color)' : '' }}>Selesai</span>
                         </div>
                         <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                           <div style={{ 
                             height: '100%', 
                             background: searchResult.status === 'COMPLETED' ? 'var(--success-color)' : 'var(--primary-color)',
                             width: searchResult.status === 'PENDING' ? '15%' : searchResult.status === 'DISPOSISI' ? '40%' : searchResult.status === 'IN_PROGRESS' ? '70%' : searchResult.status === 'COMPLETED' ? '100%' : '0%',
                             transition: 'width 0.5s ease-in-out'
                           }}></div>
                         </div>
                         <p style={{ textAlign: 'right', fontSize: '0.75rem', color: searchResult.status === 'COMPLETED' ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: 'bold', marginTop: '0.35rem' }}>
                           {searchResult.status === 'PENDING' ? '15%' : searchResult.status === 'DISPOSISI' ? '40%' : searchResult.status === 'IN_PROGRESS' ? '70%' : searchResult.status === 'COMPLETED' ? '100%' : '0%'} {searchResult.status === 'COMPLETED' ? 'Tuntas' : 'Berjalan'}
                         </p>
                       </div>

                       {/* Before / After Photos */}
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         <div>
                           <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Laporan (Sebelum)</p>
                           {searchResult.photo_url ? (
                             <div style={{ width: '100%', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', background: '#f1f5f9' }}>
                               {/* eslint-disable-next-line @next/next/no-img-element */}
                               <img src={searchResult.photo_url} alt="Sebelum" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             </div>
                           ) : (
                             <div style={{ width: '100%', height: '120px', borderRadius: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>Tanpa foto</div>
                           )}
                         </div>
                         <div>
                           <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Perbaikan (Sesudah)</p>
                           {searchResult.status === 'COMPLETED' && searchResult.report_progress?.find((p:any) => p.status === 'COMPLETED')?.evidence_url ? (
                             <div style={{ width: '100%', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', background: '#f1f5f9' }}>
                               {/* eslint-disable-next-line @next/next/no-img-element */}
                               <img src={searchResult.report_progress.find((p:any) => p.status === 'COMPLETED').evidence_url} alt="Sesudah" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             </div>
                           ) : (
                             <div style={{ width: '100%', height: '120px', borderRadius: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }}>
                               {searchResult.status === 'COMPLETED' ? 'Tanpa foto bukti' : 'Belum selesai'}
                             </div>
                           )}
                         </div>
                       </div>

                       <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>Dilaporkan pada: {new Date(searchResult.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  )}
                  {searchError && (
                    <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                      {searchError}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Edukasi & Statistik */}
          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Proses Cepat & Tepat</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
             <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', borderRadius: '1rem', borderTop: '4px solid var(--secondary-color)' }}>
               <div style={{ width: '48px', height: '48px', background: 'var(--secondary-color)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><MessageSquarePlus size={24}/></div>
               <div>
                 <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>1. Tulis Laporan</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>Jelaskan masalah & sertakan lokasi.</p>
               </div>
             </div>
             
             <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', borderRadius: '1rem', borderTop: '4px solid var(--warning-color)' }}>
               <div style={{ width: '48px', height: '48px', background: 'var(--warning-color)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><Clock size={24}/></div>
               <div>
                 <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>2. Proses Instansi</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>Diteruskan otomatis ke dinas terkait.</p>
               </div>
             </div>
             
             <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', borderRadius: '1rem', borderTop: '4px solid var(--success-color)' }}>
               <div style={{ width: '48px', height: '48px', background: 'var(--success-color)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><CheckCircle size={24}/></div>
               <div>
                 <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>3. Selesai & Bukti</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>Dapatkan foto bukti perbaikan via WA.</p>
               </div>
             </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem 1.5rem', borderRadius: '1.25rem', background: '#1e293b', color: 'white', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <TrendingUp size={32} color="var(--secondary-color)" style={{ marginBottom: '0.5rem', margin: '0 auto' }} />
              <p style={{ fontSize: '3rem', fontWeight: '900', color: 'white', lineHeight: 1, marginBottom: '0.5rem' }}>{totalAduan.toLocaleString('id-ID')}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Aduan Masuk</p>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle size={32} color="var(--success-color)" style={{ marginBottom: '0.5rem', margin: '0 auto' }} />
              <p style={{ fontSize: '3rem', fontWeight: '900', color: 'white', lineHeight: 1, marginBottom: '0.5rem' }}>{persenSelesai.toFixed(1).replace('.0', '')}%</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Diselesaikan</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}