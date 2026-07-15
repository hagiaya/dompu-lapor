-- Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
CREATE TYPE report_status AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
CREATE TYPE user_role AS ENUM ('ADMIN', 'OPD', 'EMPLOYEE', 'BUPATI');

-- Tabel Master OPD
CREATE TABLE opds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Profiles (Berelasi ke Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    opd_id UUID REFERENCES opds(id) ON DELETE SET NULL, -- Jika rolenya OPD/Pegawai
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Kategori
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Kecamatan
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- Tabel Desa
CREATE TABLE villages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- Tabel Utama: Laporan Masyarakat
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id TEXT UNIQUE NOT NULL, -- Contoh: TIKET-2024-ABC
    reporter_name TEXT NOT NULL,
    reporter_wa TEXT NOT NULL,
    district_id UUID REFERENCES districts(id),
    village_id UUID REFERENCES villages(id),
    category_id UUID REFERENCES categories(id),
    opd_id UUID REFERENCES opds(id), -- Null di awal, Admin yang assign
    complaint TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    photo_url TEXT,
    status report_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Log Progres Pekerjaan
CREATE TABLE report_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    status report_status NOT NULL,
    description TEXT,
    evidence_url TEXT,
    employee_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- Konfigurasi Row Level Security (RLS)
-- =========================================

-- Rakyat dapat membuat laporan secara anonim
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publik dapat membuat laporan" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Publik dapat melihat laporan" ON reports FOR SELECT USING (true); 

ALTER TABLE report_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publik dapat melihat log progres" ON report_progress FOR SELECT USING (true);
CREATE POLICY "Petugas dapat membuat log progres" ON report_progress FOR INSERT WITH CHECK (auth.uid() = employee_id);

-- Master data bebas dibaca
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kategori publik" ON categories FOR SELECT USING (true);

ALTER TABLE opds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "OPD publik" ON opds FOR SELECT USING (true);

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kecamatan publik" ON districts FOR SELECT USING (true);

ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Desa publik" ON villages FOR SELECT USING (true);
