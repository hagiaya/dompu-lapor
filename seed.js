require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

async function main() {
  const KAB_DOMPU_ID = '5205';
  console.log('Fetching districts for Dompu...');
  const districts = await fetchJson(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${KAB_DOMPU_ID}.json`);
  
  const formattedDistricts = [];
  const formattedVillages = [];

  for (const d of districts) {
    // Generate UUID if needed, but let's see if we can use the original string IDs.
    // If the DB requires UUID, we can use crypto.randomUUID(). Let's fetch schema info first.
    console.log(`Fetching villages for ${d.name} (${d.id})...`);
    const villages = await fetchJson(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${d.id}.json`);
    
    formattedDistricts.push({ name: d.name });
    
    for (const v of villages) {
      formattedVillages.push({ district_name: d.name, name: v.name });
    }
  }

  // Clear existing
  console.log('Clearing existing data...');
  await supabase.from('villages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('districts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Inserting districts...');
  const { data: insertedDistricts, error: dErr } = await supabase.from('districts').insert(formattedDistricts).select();
  if (dErr) {
    console.error('Error inserting districts:', dErr);
    // If it fails, maybe because we didn't provide UUIDs and it doesn't auto-generate?
    // Let's assume it has default gen_random_uuid().
  } else {
    console.log(`Inserted ${insertedDistricts.length} districts.`);
    
    // Map district names to IDs
    const districtMap = {};
    insertedDistricts.forEach(d => districtMap[d.name] = d.id);
    
    const finalVillages = formattedVillages.map(v => ({
      district_id: districtMap[v.district_name],
      name: v.name
    }));
    
    console.log('Inserting villages...');
    // Supabase insert has limit of 1000 rows, villages in dompu is < 1000 (around 81)
    const { error: vErr } = await supabase.from('villages').insert(finalVillages);
    if (vErr) {
      console.error('Error inserting villages:', vErr);
    } else {
      console.log(`Inserted ${finalVillages.length} villages.`);
    }
  }
  
  // Also categories!
  const categories = [
    { name: 'Infrastruktur Jalan & Jembatan' },
    { name: 'Kebersihan & Persampahan' },
    { name: 'Kesehatan & Rumah Sakit' },
    { name: 'Pendidikan & Sekolah' },
    { name: 'Fasilitas Umum & Taman' },
    { name: 'Lainnya' }
  ];
  
  console.log('Clearing and inserting categories...');
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('categories').insert(categories);
  
  console.log('Done!');
}

main().catch(console.error);
