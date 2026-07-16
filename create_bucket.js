require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.storage.createBucket('reports', {
    public: true,
    fileSizeLimit: 10485760 // 10MB
  });
  if (error) console.error('Error creating bucket:', error);
  else console.log('Bucket created:', data);
}

main();
