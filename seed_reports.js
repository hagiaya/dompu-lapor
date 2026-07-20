require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateTicketId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${year}-${randomNum}`;
}

const names = ['Budi Santoso', 'Siti Aminah', 'Andi Hidayat', 'Nurul Huda', 'Ahmad Dani', 'Rina Wati', 'Joko Susilo', 'Eka Putra', 'Lina Marlina', 'Desi Ratnasari', 'Aris Ansary', 'Moh. Syaukani', 'Wahoyono', 'Muhammad Nursalam', 'Mauluddin', 'Reza'];
const complaints = [
  'Jalanan berlubang sangat parah di depan balai desa dan mengganggu aktivitas warga.',
  'Sampah menumpuk berhari-hari tidak diangkut sehingga menimbulkan bau tidak sedap.',
  'Fasilitas puskesmas kurang memadai untuk melayani masyarakat, antrean terlalu panjang.',
  'Atap sekolah dasar roboh akibat hujan deras semalam, mohon segera diperbaiki.',
  'Penerangan jalan umum mati total sejak seminggu yang lalu, rawan tindak kejahatan.',
  'Saluran air mampet menyebabkan genangan air parah saat hujan turun.',
  'Jembatan penghubung desa rusak akibat banjir dan sangat membahayakan warga.',
  'Kekurangan pasokan air bersih sejak musim kemarau, kami kesulitan mendapat air minum.',
  'Pelayanan administrasi publik di kantor kelurahan sangat lambat dan tidak efisien.',
  'Banyak pohon rindang tumbang yang menutupi jalan raya akibat angin kencang.',
  'Mohon segera aspal jalan lingkungan yang masih tanah.',
  'Kurangnya fasilitas tempat pembuangan sampah (TPS) sementara.',
  'Ada pungutan liar saat mengurus izin bangunan.',
  'Lampu lalu lintas di persimpangan rusak sehingga lalu lintas kacau.',
  'Tolong fasilitasi bantuan bibit unggul untuk para petani di desa ini.'
];
const statuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];

async function seedReports() {
  console.log('Fetching master data...');
  const { data: districts } = await supabase.from('districts').select('id, name');
  const { data: villages } = await supabase.from('villages').select('id, district_id');
  const { data: categories } = await supabase.from('categories').select('id, name');
  const { data: opds } = await supabase.from('opds').select('id, name');

  if (!districts || !villages || !categories || !opds) {
    console.error('Failed to fetch master data. Check your database tables.');
    return;
  }

  const newReports = [];
  
  for (let i = 0; i < 700; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomComplaint = complaints[Math.floor(Math.random() * complaints.length)];
    const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
    const districtVillages = villages.filter(v => v.district_id === randomDistrict.id);
    const randomVillage = districtVillages.length > 0 ? districtVillages[Math.floor(Math.random() * districtVillages.length)] : villages[Math.floor(Math.random() * villages.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomOpd = (randomStatus !== 'PENDING' && randomStatus !== 'REJECTED') ? opds[Math.floor(Math.random() * opds.length)].id : null;
    
    // Random date within the last 365 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));

    newReports.push({
      ticket_id: generateTicketId() + '-' + i, // Append i to ensure uniqueness
      reporter_name: randomName,
      reporter_wa: '0812' + Math.floor(10000000 + Math.random() * 90000000), // Random number
      district_id: randomDistrict.id,
      village_id: randomVillage.id,
      category_id: randomCategory.id,
      opd_id: randomOpd,
      complaint: randomComplaint,
      status: randomStatus,
      created_at: date.toISOString()
    });
  }

  console.log(`Prepared ${newReports.length} reports. Inserting in chunks of 100...`);
  
  for (let i = 0; i < newReports.length; i += 100) {
    const chunk = newReports.slice(i, i + 100);
    const { error } = await supabase.from('reports').insert(chunk);
    if (error) {
      console.error(`Error inserting chunk ${i} - ${i + 100}:`, error.message);
    } else {
      console.log(`Inserted ${i + chunk.length} / 700`);
    }
  }
  
  console.log('Seeding complete.');
}

seedReports();
