const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: r } = await supabase.from('reports').select('*').limit(1);
  console.log('Reports schema:', r && r[0] ? Object.keys(r[0]) : 'no reports');
  const { data: p } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profiles schema:', p && p[0] ? Object.keys(p[0]) : 'no profiles');
}
run();
