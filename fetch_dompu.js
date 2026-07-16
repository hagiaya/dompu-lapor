const fs = require('fs');
const https = require('https');

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

async function main() {
  const KAB_DOMPU_ID = '5205';
  console.log('Fetching districts for Dompu...');
  const districts = await fetchJson(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${KAB_DOMPU_ID}.json`);
  
  let sql = `-- Seed Data for Dompu\n\n`;
  sql += `DELETE FROM public.villages;\n`;
  sql += `DELETE FROM public.districts;\n\n`;
  
  for (const district of districts) {
    const dId = district.id;
    const dName = district.name.replace(/'/g, "''");
    
    // In our schema, districts might just use uuid. But let's check schema first.
    // Wait, let's just generate standard insert.
    // Actually, I should check the schema first. Let me just write the data to a JSON file first.
  }
  
  fs.writeFileSync('dompu_data.json', JSON.stringify(districts, null, 2));
  console.log('Saved to dompu_data.json');
}

main().catch(console.error);
