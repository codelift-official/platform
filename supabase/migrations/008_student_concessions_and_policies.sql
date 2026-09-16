-- ==============================================================================
-- Migration 008: Student Tuition Structure & Comprehensive RLS Policies
-- ==============================================================================

-- 1. Add base_fee, concession_amount, concession_reason to students table
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS base_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS concession_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS concession_reason text DEFAULT '';

-- 2. Comprehensive Row Level Security (RLS) Policies on students table
-- Ensures students can always be fetched on app load, directories, login,
-- and all student creations and updates persist to Supabase without RLS blockage.

DROP POLICY IF EXISTS "students_public_select" ON public.students;
CREATE POLICY "students_public_select" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "students_public_insert" ON public.students;
CREATE POLICY "students_public_insert" ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "students_public_update" ON public.students;
CREATE POLICY "students_public_update" ON public.students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "students_public_delete" ON public.students;
CREATE POLICY "students_public_delete" ON public.students FOR DELETE USING (true);

-- 3. Comprehensive Row Level Security (RLS) Policies on fees table
-- Ensures student fee records can be recorded and read synchronously.
DROP POLICY IF EXISTS "fees_public_select" ON public.fees;
CREATE POLICY "fees_public_select" ON public.fees FOR SELECT USING (true);

DROP POLICY IF EXISTS "fees_public_all" ON public.fees;
CREATE POLICY "fees_public_all" ON public.fees FOR ALL USING (true);

-- 4. Fix student auto-provisioning trigger to ensure extensions schema (pgcrypto) is in search_path
CREATE OR REPLACE FUNCTION public.handle_student_auth_provisioning()
RETURNS trigger AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if user already exists in auth.users by email
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(new.email) LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Existing user: set password to 'password' and ensure confirmed
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('password', extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = v_user_id;

    new.id := v_user_id;
  ELSE
    -- Create auth user with default password 'password'
    v_user_id := coalesce(new.id, gen_random_uuid());
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      aud,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      new.email,
      extensions.crypt('password', extensions.gen_salt('bf')),
      now(),
      'authenticated',
      'authenticated',
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('name', new.name, 'role', 'student', 'email_verified', true),
      now(),
      now()
    );

    new.id := v_user_id;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

