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
        const imgBbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '2960a369656fb39fbd0c885e34be6228'; // fallback demo key
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgBbKey}`, {
          method: 'POST',
          body: imgFormData
        });
        const data = await res.json();
        if (data.success) {
          uploadedPhotoUrl = data.data.url;
        }
      } catch (err) {
        console.error("ImgBB error", err);
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
      .select('status, complaint, created_at')
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
    };
    fetchData();
  }, []);

  const filteredVillages = villages.filter(v => v.district_id === selectedDistrict);

  return (
    <div style={{ minHeight: '100vh', background: '#cbd5e1', display: 'flex', justifyContent: 'center' }}>
      {/* Mobile Device Frame Simulation */}
      <div style={{ width: '100%', maxWidth: '430px', background: 'var(--background)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 0 40px rgba(0,0,0,0.15)', overflowX: 'hidden' }}>
        
        {/* Header / Top Bar */}
        <header style={{ padding: '1rem 1.25rem', background: 'var(--surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h2 style={{ color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Image src="/logo copy.jpeg" alt="SiMAJU Logo" width={36} height={36} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            SiMAJU
          </h2>
          <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Masuk Staff
          </Link>
        </header>

        {/* Scrollable Content */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', paddingBottom: '3rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.75rem', color: 'var(--primary-color)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
              Sistem Informasi Masyarakat <br /> menuju <span style={{ color: 'var(--secondary-color)' }}>Dompu Maju</span>
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Sampaikan keluhan fasilitas publik Dompu. Cepat, Mudah, dan Transparan.
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
                <form onSubmit={handleSubmit}>
                  {ticketId && (
                    <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '0.75rem', marginBottom: '1rem', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <CheckCircle size={24} style={{ margin: '0 auto 0.5rem auto' }} />
                      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Berhasil Dikirim!</p>
                      <p style={{ fontSize: '0.9rem' }}>Kode Tiket Anda: <strong style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>{ticketId}</strong></p>
                      <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Simpan kode ini untuk melacak laporan.</p>
                    </div>
                  )}
                  {submitMessage && !ticketId && (
                    <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
                      <p>{submitMessage}</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> Nama Lengkap</label>
                      <input type="text" name="reporter_name" className="form-input" placeholder="Sesuai KTP" required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} /> WhatsApp Aktif</label>
                      <input type="tel" name="reporter_wa" className="form-input" placeholder="08..." required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
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
                    <div style={{ marginTop: '2rem', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '1rem', textAlign: 'left', background: '#f8fafc' }}>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Status Terkini</p>
                       <h4 style={{ fontSize: '1.3rem', color: 'var(--primary-color)', marginBottom: '0.75rem', marginTop: '0.25rem' }}>{searchResult.status}</h4>
                       <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>"{searchResult.complaint}"</p>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Dilaporkan pada: {new Date(searchResult.created_at).toLocaleDateString('id-ID')}</p>
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
             <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '1rem', borderLeft: '4px solid var(--secondary-color)' }}>
               <div style={{ width: '48px', height: '48px', background: 'var(--secondary-color)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><MessageSquarePlus size={24}/></div>
               <div>
                 <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>1. Tulis Laporan</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>Jelaskan masalah & sertakan lokasi.</p>
               </div>
             </div>
             
             <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '1rem', borderLeft: '4px solid var(--warning-color)' }}>
               <div style={{ width: '48px', height: '48px', background: 'var(--warning-color)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><Clock size={24}/></div>
               <div>
                 <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>2. Proses Instansi</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>Diteruskan otomatis ke dinas terkait.</p>
               </div>
             </div>
             
             <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '1rem', borderLeft: '4px solid var(--success-color)' }}>
               <div style={{ width: '48px', height: '48px', background: 'var(--success-color)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><CheckCircle size={24}/></div>
               <div>
                 <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>3. Selesai & Bukti</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>Dapatkan foto bukti perbaikan via WA.</p>
               </div>
             </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem 1.5rem', borderRadius: '1.25rem', background: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <TrendingUp size={32} color="var(--secondary-color)" style={{ marginBottom: '0.5rem', margin: '0 auto' }} />
              <p style={{ fontSize: '3rem', fontWeight: '900', color: 'white', lineHeight: 1, marginBottom: '0.5rem' }}>1.402</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Aduan Masuk</p>
            </div>
            <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={32} color="var(--success-color)" style={{ marginBottom: '0.5rem', margin: '0 auto' }} />
              <p style={{ fontSize: '3rem', fontWeight: '900', color: 'white', lineHeight: 1, marginBottom: '0.5rem' }}>98.5%</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Diselesaikan</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}