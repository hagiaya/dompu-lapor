-- =================================================================================
-- CARA PENGGUNAAN:
-- 1. Buka Supabase Dashboard proyek Anda.
-- 2. Masuk ke menu "SQL Editor".
-- 3. Salin semua kode di bawah ini dan jalankan (Run).
-- 4. Anda akan memiliki 1 akun Admin dengan:
--    Email: admin@dompu.go.id
--    Password: AdminDompu123!
-- =================================================================================

-- Pastikan ekstensi pgcrypto aktif untuk hashing password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- 1. Memasukkan kredensial ke auth.users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    'admin@dompu.go.id', crypt('AdminDompu123!', gen_salt('bf')), 
    now(), '{"provider":"email","providers":["email"]}', '{"name":"Super Admin"}', now(), now()
  );

  -- 2. Membuat identitas profil Admin di public.profiles
  INSERT INTO public.profiles (id, name, role)
  VALUES (new_user_id, 'Super Admin', 'ADMIN');

END $$;
