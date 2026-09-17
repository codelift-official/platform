-- ==============================================================================
-- Migration 009: Comprehensive RLS for Tests, Assessments & Assignments
-- ==============================================================================
-- Ensures tests, test questions, batch assessments, test attempts, assignments,
-- batch assignments, and submissions are accessible across all client authentication
-- states (matching the pattern established in Migration 008 for students and fees).

-- 1. TESTS TABLE
DROP POLICY IF EXISTS "tests_read" ON public.tests;
DROP POLICY IF EXISTS "tests_admin_all" ON public.tests;
DROP POLICY IF EXISTS "tests_public_select" ON public.tests;
DROP POLICY IF EXISTS "tests_public_all" ON public.tests;

CREATE POLICY "tests_public_select" ON public.tests FOR SELECT USING (true);
CREATE POLICY "tests_public_all" ON public.tests FOR ALL USING (true);

-- 2. TEST QUESTIONS TABLE
DROP POLICY IF EXISTS "test_questions_read" ON public.test_questions;
DROP POLICY IF EXISTS "test_questions_admin_all" ON public.test_questions;
DROP POLICY IF EXISTS "test_questions_public_select" ON public.test_questions;
DROP POLICY IF EXISTS "test_questions_public_all" ON public.test_questions;

CREATE POLICY "test_questions_public_select" ON public.test_questions FOR SELECT USING (true);
CREATE POLICY "test_questions_public_all" ON public.test_questions FOR ALL USING (true);

-- 3. BATCH_TESTS JUNCTION TABLE
DROP POLICY IF EXISTS "batch_tests_read" ON public.batch_tests;
DROP POLICY IF EXISTS "batch_tests_admin_all" ON public.batch_tests;
DROP POLICY IF EXISTS "batch_tests_public_select" ON public.batch_tests;
DROP POLICY IF EXISTS "batch_tests_public_all" ON public.batch_tests;

CREATE POLICY "batch_tests_public_select" ON public.batch_tests FOR SELECT USING (true);
CREATE POLICY "batch_tests_public_all" ON public.batch_tests FOR ALL USING (true);

-- 4. TEST ATTEMPTS TABLE
DROP POLICY IF EXISTS "attempts_own_read" ON public.test_attempts;
DROP POLICY IF EXISTS "attempts_own_insert" ON public.test_attempts;
DROP POLICY IF EXISTS "attempts_admin_all" ON public.test_attempts;
DROP POLICY IF EXISTS "attempts_public_select" ON public.test_attempts;
DROP POLICY IF EXISTS "attempts_public_all" ON public.test_attempts;

CREATE POLICY "attempts_public_select" ON public.test_attempts FOR SELECT USING (true);
CREATE POLICY "attempts_public_all" ON public.test_attempts FOR ALL USING (true);

-- 5. ASSIGNMENTS TABLE
DROP POLICY IF EXISTS "assignments_read" ON public.assignments;
DROP POLICY IF EXISTS "assignments_admin_all" ON public.assignments;
DROP POLICY IF EXISTS "assignments_public_select" ON public.assignments;
DROP POLICY IF EXISTS "assignments_public_all" ON public.assignments;

CREATE POLICY "assignments_public_select" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "assignments_public_all" ON public.assignments FOR ALL USING (true);

-- 6. BATCH_ASSIGNMENTS JUNCTION TABLE
DROP POLICY IF EXISTS "batch_assignments_read" ON public.batch_assignments;
DROP POLICY IF EXISTS "batch_assignments_admin_all" ON public.batch_assignments;
DROP POLICY IF EXISTS "batch_assignments_public_select" ON public.batch_assignments;
DROP POLICY IF EXISTS "batch_assignments_public_all" ON public.batch_assignments;

CREATE POLICY "batch_assignments_public_select" ON public.batch_assignments FOR SELECT USING (true);
CREATE POLICY "batch_assignments_public_all" ON public.batch_assignments FOR ALL USING (true);

-- 7. SUBMISSIONS TABLE
DROP POLICY IF EXISTS "submissions_read" ON public.submissions;
DROP POLICY IF EXISTS "submissions_own_insert" ON public.submissions;
DROP POLICY IF EXISTS "submissions_own_update" ON public.submissions;
DROP POLICY IF EXISTS "submissions_admin_all" ON public.submissions;
DROP POLICY IF EXISTS "submissions_public_select" ON public.submissions;
DROP POLICY IF EXISTS "submissions_public_all" ON public.submissions;

CREATE POLICY "submissions_public_select" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "submissions_public_all" ON public.submissions FOR ALL USING (true);
