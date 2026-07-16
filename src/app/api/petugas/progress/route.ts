import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { reportId, employeeId, progressPercentage, progressNote } = await request.json();
    
    if (!reportId || !employeeId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const description = `[${progressPercentage}%] ${progressNote || 'Progres diperbarui'}`;

    const { error: pErr } = await supabase.from('report_progress')
      .insert({ 
        report_id: reportId,
        employee_id: employeeId,
        status: 'IN_PROGRESS', 
        description: description 
      });
      
    if (pErr) throw pErr;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Progress API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
