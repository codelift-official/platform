-- 017_email_quota_log.sql
-- Logs outgoing EmailJS dispatches for monthly quota tracking (200/month cap)
-- and administrative audits.

create table if not exists public.email_quota_log (
  id bigserial primary key,
  sent_at timestamptz default now(),
  event_type text not null,
  recipient_email text not null,
  recipient_name text,
  subject text,
  success boolean default true,
  error_message text
);

create index if not exists idx_email_quota_log_sent_at on public.email_quota_log (sent_at);
create index if not exists idx_email_quota_log_event_type on public.email_quota_log (event_type);

-- RLS: Enable RLS and allow read/insert for authenticated & service role
alter table public.email_quota_log enable row level security;

drop policy if exists "email_quota_log_read" on public.email_quota_log;
create policy "email_quota_log_read" on public.email_quota_log
  for select using (true);

drop policy if exists "email_quota_log_insert" on public.email_quota_log;
create policy "email_quota_log_insert" on public.email_quota_log
  for insert with check (true);
