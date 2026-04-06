-- Add sitter_insurance as a verification type
alter table public.verifications
  drop constraint verifications_type_check,
  add constraint verifications_type_check
    check (type in ('dni_nie', 'background_check', 'address', 'sitter_insurance'));

-- Track insurance verification on sitter profile
alter table public.sitter_profiles
  add column has_insurance boolean not null default false,
  add column insurance_verified_at timestamptz;
