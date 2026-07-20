import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '@/lib/fonnte';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { progressId, reportId, evidenceUrl } = await request.json();
    
    // Update report_progress
    const { error: pErr } = await supabase.from('report_progress')
      .update({ status: 'COMPLETED', evidence_url: evidenceUrl })
      .eq('id', progressId);
    if (pErr) throw pErr;

    // Update reports
    const { error: rErr } = await supabase.from('reports')
      .update({ status: 'COMPLETED' })
      .eq('id', reportId);
    if (rErr) throw rErr;

    // Fetch report to send WA
    const { data: report } = await supabase.from('reports')
      .select('reporter_wa, ticket_id, complaint')
      .eq('id', reportId)
      .single();
      
    if (report && report.reporter_wa) {
      const message = `*Laporan Selesai Dikerjakan!*\n\nLaporan Anda dengan kode tiket *${report.ticket_id}* telah selesai ditangani oleh petugas.\n\n*Detail Keluhan:*\n${report.complaint || '-'}\n\nTerima kasih atas partisipasi Anda dalam membangun Dompu yang lebih baik.\n_Lapor Cepat, DOMPU HEBAT!_`;
      await sendWhatsAppMessage(report.reporter_wa, message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Complete API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
