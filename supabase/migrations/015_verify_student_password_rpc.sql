-- Migration 015: Server-side student password verification for direct-DB login
-- Purpose: Student login validates credentials with a single live DB call (verify_student_password),
-- completely independent of localStorage. The public.students.password column (or progress->__auth_pwd)
-- is the canonical credential source; auth.users is synced separately by set_student_password.

CREATE OR REPLACE FUNCTION public.verify_student_password(
  p_identifier TEXT,
  p_password TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_student public.students%ROWTYPE;
BEGIN
  IF p_identifier IS NULL OR trim(p_identifier) = '' OR p_password IS NULL OR p_password = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing identifier or password');
  END IF;

  SELECT * INTO v_student
  FROM public.students
  WHERE (id::text = p_identifier)
     OR (legacy_id = p_identifier)
     OR (LOWER(email) = LOWER(p_identifier))
  LIMIT 1;

  IF v_student.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Student not found');
  END IF;

  IF v_student.is_active = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'SUSPENDED');
  END IF;

  IF v_student.password IS NULL OR v_student.password = '' THEN
    v_student.password := 'codelift123';
  END IF;

  IF v_student.password = p_password THEN
    RETURN jsonb_build_object(
      'success', true,
      'student', row_to_json(v_student)::jsonb
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Invalid credentials');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION public.verify_student_password(TEXT, TEXT) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';