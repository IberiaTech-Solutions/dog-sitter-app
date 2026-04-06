create table sitter_availability (
  id uuid primary key default gen_random_uuid(),
  sitter_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  is_available boolean not null default true,
  created_at timestamptz default now(),
  unique (sitter_id, date)
);

create index idx_sitter_availability_sitter_date on sitter_availability (sitter_id, date);

alter table sitter_availability enable row level security;

create policy "Anyone can read availability"
  on sitter_availability for select
  using (true);

create policy "Sitters can insert their own availability"
  on sitter_availability for insert
  with check (auth.uid() = sitter_id);

create policy "Sitters can update their own availability"
  on sitter_availability for update
  using (auth.uid() = sitter_id);

create policy "Sitters can delete their own availability"
  on sitter_availability for delete
  using (auth.uid() = sitter_id);
