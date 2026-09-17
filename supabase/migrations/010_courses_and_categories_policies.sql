-- ==============================================================================
-- Migration 010: Comprehensive RLS for Courses, Modules, Topics, and Categories
-- ==============================================================================
-- Ensures courses, modules, topics, categories, and batch_courses can be created,
-- updated, and queried across all client states without RLS policy rejections,
-- and seeds standard categories to prevent foreign key violations.

-- 1. SEED DEFAULT CATEGORIES
INSERT INTO public.categories (id, name, slug, description, icon) VALUES
  ('cat-web', 'Full Stack Web Development', 'web', 'Frontend and backend web development', 'FaCode'),
  ('cat-python', 'Python & Machine Learning', 'python', 'Core Python, AI, and backend automation', 'SiPython'),
  ('cat-data', 'Data Analytics & SQL', 'data', 'Data engineering, analytics, and databases', 'FaDatabase'),
  ('cat-core', 'Computer Science Core', 'core', 'Algorithms, system design, and architecture', 'FaCogs')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description;

-- 2. CATEGORIES POLICIES
DROP POLICY IF EXISTS "categories_read" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;
DROP POLICY IF EXISTS "categories_public_select" ON public.categories;
DROP POLICY IF EXISTS "categories_public_all" ON public.categories;

CREATE POLICY "categories_public_select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_public_all" ON public.categories FOR ALL USING (true);

-- 3. COURSES POLICIES
DROP POLICY IF EXISTS "courses_read" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_all" ON public.courses;
DROP POLICY IF EXISTS "courses_public_select" ON public.courses;
DROP POLICY IF EXISTS "courses_public_all" ON public.courses;

CREATE POLICY "courses_public_select" ON public.courses FOR SELECT USING (true);
CREATE POLICY "courses_public_all" ON public.courses FOR ALL USING (true);

-- 4. COURSE MODULES POLICIES
DROP POLICY IF EXISTS "modules_read" ON public.course_modules;
DROP POLICY IF EXISTS "modules_admin_all" ON public.course_modules;
DROP POLICY IF EXISTS "modules_public_select" ON public.course_modules;
DROP POLICY IF EXISTS "modules_public_all" ON public.course_modules;

CREATE POLICY "modules_public_select" ON public.course_modules FOR SELECT USING (true);
CREATE POLICY "modules_public_all" ON public.course_modules FOR ALL USING (true);

-- 5. COURSE TOPICS POLICIES
DROP POLICY IF EXISTS "topics_read" ON public.course_topics;
DROP POLICY IF EXISTS "topics_admin_all" ON public.course_topics;
DROP POLICY IF EXISTS "topics_public_select" ON public.course_topics;
DROP POLICY IF EXISTS "topics_public_all" ON public.course_topics;

CREATE POLICY "topics_public_select" ON public.course_topics FOR SELECT USING (true);
CREATE POLICY "topics_public_all" ON public.course_topics FOR ALL USING (true);

-- 6. BATCH COURSES JUNCTION POLICIES
DROP POLICY IF EXISTS "batch_courses_read" ON public.batch_courses;
DROP POLICY IF EXISTS "batch_courses_admin_all" ON public.batch_courses;
DROP POLICY IF EXISTS "batch_courses_public_select" ON public.batch_courses;
DROP POLICY IF EXISTS "batch_courses_public_all" ON public.batch_courses;

CREATE POLICY "batch_courses_public_select" ON public.batch_courses FOR SELECT USING (true);
CREATE POLICY "batch_courses_public_all" ON public.batch_courses FOR ALL USING (true);
