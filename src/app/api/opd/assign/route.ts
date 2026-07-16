import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { reportId, employeeId, instruction } = await request.json();
    
    if (!reportId || !employeeId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update report status to IN_PROGRESS
    const { error: rError } = await supabase.from('reports')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', reportId);

    if (rError) throw rError;

    // 2. Insert into report_progress
    const { error: pError } = await supabase.from('report_progress')
      .insert({
        report_id: reportId,
        status: 'IN_PROGRESS',
        description: instruction,
        employee_id: employeeId
      });

    if (pError) throw pError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Assign API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
