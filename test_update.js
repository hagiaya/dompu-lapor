require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function main() {
  const { data, error } = await supabase.from('reports').update({ status: 'TEST' }).eq('ticket_id', 'TKT-2026-3635').select();
  console.log('Update result:', data, error);
}
main();
