-- ==============================================================================
-- CodeLift Platform - Course Topics & Modules Quiz Questions Support
-- Migration: 011_course_topics_quiz_questions.sql
-- ==============================================================================

-- 1. Support module-level & topic-level assessment quizzes directly in DB
ALTER TABLE IF EXISTS public.course_topics 
  ADD COLUMN IF NOT EXISTS quiz_questions jsonb DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS public.course_modules 
  ADD COLUMN IF NOT EXISTS quiz_questions jsonb DEFAULT '[]'::jsonb;

-- 2. Confirm RLS policies on course_topics and course_modules
ALTER TABLE IF EXISTS public.course_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "topics_public_all" ON public.course_topics;
CREATE POLICY "topics_public_all" ON public.course_topics FOR ALL USING (true);

DROP POLICY IF EXISTS "modules_public_all" ON public.course_modules;
CREATE POLICY "modules_public_all" ON public.course_modules FOR ALL USING (true);
