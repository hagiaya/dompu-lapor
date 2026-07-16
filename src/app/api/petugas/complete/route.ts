import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Complete API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
