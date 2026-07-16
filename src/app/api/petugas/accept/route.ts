import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { progressId, reportId } = await request.json();
    
    if (!progressId || !reportId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update report_progress to IN_PROGRESS
    const { error: pError } = await supabase.from('report_progress')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', progressId);

    if (pError) throw pError;

    // 2. Update reports to IN_PROGRESS
    const { error: rError } = await supabase.from('reports')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', reportId);

    if (rError) throw rError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Accept API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
