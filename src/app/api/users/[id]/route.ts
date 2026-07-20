import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { name, role, opd_id } = await request.json();

    // Update public.profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        name: name,
        role: role,
        opd_id: opd_id || null
      })
      .eq('id', params.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // Optional: update auth.users metadata if needed
    if (name) {
      await supabaseAdmin.auth.admin.updateUserById(params.id, {
        user_metadata: { name }
      });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Delete from auth.users (will cascade delete profiles if set up correctly, 
    // but we can manually delete from profiles first just in case)
    await supabaseAdmin.from('profiles').delete().eq('id', params.id);
    
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(params.id);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
