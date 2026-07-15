'use server';

import { createClient } from '@supabase/supabase-js';

// Pastikan untuk menggunakan SERVICE ROLE KEY untuk hak akses admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function createUserAccount(data: {
  email: string;
  password?: string;
  name: string;
  role: 'ADMIN' | 'OPD' | 'EMPLOYEE' | 'BUPATI';
  opdId?: string; // Jika role = OPD atau EMPLOYEE
}) {
  if (!supabaseServiceKey) {
    return { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env.local' };
  }

  // Gunakan service role untuk memotong RLS dan tidak me-logout sesi user aktif
  const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const defaultPassword = data.password || 'DompuHebat2024!';

  try {
    // 1. Create user di Supabase Auth
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email: data.email,
      password: defaultPassword,
      email_confirm: true, // Otomatis terverifikasi
      user_metadata: { name: data.name }
    });

    if (authError) {
      console.error('Auth Error:', authError);
      return { success: false, error: authError.message };
    }

    const userId = authData.user.id;

    // 2. Jika pembuatan auth berhasil, insert ke tabel profiles
    // Kita juga bypass RLS untuk insert
    const profilePayload: any = {
      id: userId,
      name: data.name,
      role: data.role
    };

    if (data.opdId) {
      profilePayload.opd_id = data.opdId;
    }

    const { error: profileError } = await adminAuthClient
      .from('profiles')
      .insert(profilePayload);

    if (profileError) {
      // Jika profile gagal, idealnya kita menghapus auth usernya kembali (rollback)
      await adminAuthClient.auth.admin.deleteUser(userId);
      console.error('Profile Error:', profileError);
      return { success: false, error: profileError.message };
    }

    return { 
      success: true, 
      user: { id: userId, email: data.email, name: data.name, role: data.role, defaultPassword }
    };

  } catch (error: any) {
    console.error('Action Error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}
