-- Migration 013: Add password column to public.students table
-- Purpose: Persist student portal passwords on server-side to guarantee permanence
-- across browser sessions, 1-hour JWT token refreshes, and multi-device access.

ALTER TABLE IF EXISTS public.students
  ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'codelift123';

COMMENT ON COLUMN public.students.password IS
  'Student portal password. Defaults to codelift123. Preserved across session refreshes and admin resets.';
