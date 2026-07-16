require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'ALTER TABLE reports DISABLE ROW LEVEL SECURITY; ALTER TABLE report_progress DISABLE ROW LEVEL SECURITY;' });
  
  if (error) {
     console.error('RPC failed, trying fallback...', error);
  } else {
     console.log('RLS disabled via RPC');
  }
}

main();
