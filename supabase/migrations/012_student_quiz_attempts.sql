-- ==============================================================================
-- CodeLift Platform - Student Quiz Attempts Support
-- Migration: 012_student_quiz_attempts.sql
-- ==============================================================================

-- 1. Add quiz_attempts jsonb column to students table if not exists
ALTER TABLE IF EXISTS public.students 
  ADD COLUMN IF NOT EXISTS quiz_attempts jsonb DEFAULT '{}'::jsonb;

-- 2. Add documentation comment describing data shape
COMMENT ON COLUMN public.students.quiz_attempts IS 
  'Stores student quiz submission results per topic: { [topicId]: { score, totalMarks, percentage, passed, rating, submittedAt } }';

-- 3. Notify PostgREST to immediately refresh its schema cache
NOTIFY pgrst, 'reload schema';
