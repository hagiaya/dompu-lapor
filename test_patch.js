require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: reports, error: getErr } = await supabase.from('reports').select('id, opd_id, status').limit(1);
  if (!reports || reports.length === 0) return console.log("No reports found");
  
  const report = reports[0];
  console.log("Found report:", report);
  
  const { data: opds } = await supabase.from('opds').select('id').limit(1);
  if (!opds || opds.length === 0) return console.log("No opds found");
  
  const opdId = opds[0].id;
  console.log("Using OPD:", opdId);

  const { data, error } = await supabase.from('reports').update({ opd_id: opdId, status: 'ACCEPTED' }).eq('id', report.id).select();
  
  console.log("Update result:", data);
  if (error) console.error("Update error:", error);
}

main();
