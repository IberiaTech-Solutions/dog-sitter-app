create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  barrio text,
  source text not null default 'landing',
  user_agent text,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_unique on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

create policy "waitlist_insert_anyone"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

create policy "waitlist_select_service"
  on public.waitlist
  for select
  to service_role
  using (true);
