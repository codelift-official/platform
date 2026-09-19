-- 016_certificate_persistence.sql
-- Persists the full admin-provisioned certificate data so nothing supplied by
-- the admin (signatory name/title, institute, template design snapshot) is lost
-- across reloads or DB round-trips.

-- 1) Issued certificates now carry their design snapshot + template + course link.
alter table public.certificates
  add column if not exists template_id text,
  add column if not exists design jsonb,
  add column if not exists course_id text;

create index if not exists idx_certificates_template_id on public.certificates (template_id);
create index if not exists idx_certificates_course_id on public.certificates (course_id);

-- 2) Single-row platform settings (institute + certificate signatory credentials).
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- RLS: authenticated users may read (harmless public academy info used to
-- pre-fill admin forms), only admins may write. Mirrors the existing
-- certificate_templates policies pattern.
alter table public.platform_settings enable row level security;

drop policy if exists "platform_settings_auth_read" on public.platform_settings;
create policy "platform_settings_auth_read" on public.platform_settings
  for select using (auth.role() = 'authenticated' or is_admin());

drop policy if exists "platform_settings_admin_all" on public.platform_settings;
create policy "platform_settings_admin_all" on public.platform_settings
  for all using (is_admin());