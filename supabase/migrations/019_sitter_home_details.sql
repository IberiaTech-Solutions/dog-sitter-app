-- Sitter home environment details
alter table public.sitter_profiles
  add column home_type text check (home_type in ('apartment', 'house')),
  add column has_yard boolean default false,
  add column has_children boolean default false,
  add column has_own_pets text; -- e.g. "1 dog, 2 cats" or null
