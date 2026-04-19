-- ============================================================
-- 021_partner_profiles.sql
-- Business partners as a first-class user role.
--
-- Phase 0: partners sign themselves up, admin verifies, partners
-- self-manage their own discount offerings. Redemptions are tracked
-- via signed-token QR codes for analytics + manual verification at
-- the partner's physical location.
--
-- Phase 1 hook: partner_discount_redemptions.referred_sitter_id
-- supports the partner→sitter referral growth loop.
--
-- Fully idempotent — safe to run multiple times or to replay on a
-- partial apply (drop-if-exists + create-if-not-exists throughout).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extend profiles.role to include 'partner'
-- ------------------------------------------------------------

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('owner', 'sitter', 'both', 'admin', 'partner'));

-- ------------------------------------------------------------
-- 2. Extend partner_discounts.partner_type to match landing categories
-- (adds 'trainer', 'nutritionist')
-- ------------------------------------------------------------

alter table public.partner_discounts drop constraint if exists partner_discounts_partner_type_check;
alter table public.partner_discounts add constraint partner_discounts_partner_type_check
  check (partner_type in ('vet', 'pet_shop', 'grooming', 'trainer', 'nutritionist', 'other'));

-- ------------------------------------------------------------
-- 3. partner_profiles — extends profiles for business partners.
-- Mirrors the sitter_profiles pattern (id FK to profiles.id).
-- ------------------------------------------------------------

create table if not exists public.partner_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  business_name text not null,
  business_type text not null check (business_type in ('vet', 'pet_shop', 'grooming', 'trainer', 'nutritionist', 'other')),
  tax_id text, -- NIF/CIF. Optional at signup; required before billing (Phase 2).
  address text,
  city text not null,
  postal_code text,
  phone text,
  website text,
  logo_url text,
  description_es text,
  description_en text,
  is_verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_partner_profiles_city on public.partner_profiles (city);
create index if not exists idx_partner_profiles_verified on public.partner_profiles (is_verified);

-- updated_at trigger (reuses the existing handle_updated_at function)
drop trigger if exists handle_partner_profiles_updated_at on public.partner_profiles;
create trigger handle_partner_profiles_updated_at
  before update on public.partner_profiles
  for each row execute function public.handle_updated_at();

alter table public.partner_profiles enable row level security;

drop policy if exists "Verified partners viewable by everyone" on public.partner_profiles;
create policy "Verified partners viewable by everyone"
  on public.partner_profiles for select
  using (is_verified = true);

drop policy if exists "Partners can view their own profile" on public.partner_profiles;
create policy "Partners can view their own profile"
  on public.partner_profiles for select
  using (auth.uid() = id);

drop policy if exists "Partners can insert their own profile" on public.partner_profiles;
create policy "Partners can insert their own profile"
  on public.partner_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Partners can update their own profile" on public.partner_profiles;
create policy "Partners can update their own profile"
  on public.partner_profiles for update
  using (auth.uid() = id);

drop policy if exists "Admins can manage all partner profiles" on public.partner_profiles;
create policy "Admins can manage all partner profiles"
  on public.partner_profiles for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ------------------------------------------------------------
-- 4. Link partner_discounts to partner_profiles.
-- Nullable for back-compat with legacy admin-created rows; new
-- partner-authored rows populate partner_id + pull partner_name / city
-- from the joined partner_profiles.
-- ------------------------------------------------------------

alter table public.partner_discounts
  add column if not exists partner_id uuid references public.partner_profiles(id) on delete cascade;

create index if not exists idx_partner_discounts_partner on public.partner_discounts (partner_id);

drop policy if exists "Partners can view their own discounts" on public.partner_discounts;
create policy "Partners can view their own discounts"
  on public.partner_discounts for select
  using (partner_id = auth.uid());

drop policy if exists "Partners can insert their own discounts" on public.partner_discounts;
create policy "Partners can insert their own discounts"
  on public.partner_discounts for insert
  with check (partner_id = auth.uid());

drop policy if exists "Partners can update their own discounts" on public.partner_discounts;
create policy "Partners can update their own discounts"
  on public.partner_discounts for update
  using (partner_id = auth.uid());

drop policy if exists "Partners can delete their own discounts" on public.partner_discounts;
create policy "Partners can delete their own discounts"
  on public.partner_discounts for delete
  using (partner_id = auth.uid());

-- ------------------------------------------------------------
-- 5. partner_discount_redemptions — track issuance + QR-based redemption.
--
-- Flow:
--   (1) Owner or sitter taps "Use discount" in-app → row inserted with
--       redemption_token, status='issued', expires_at ~30d.
--   (2) App renders QR encoding the token, user presents at partner.
--   (3) Partner scans QR or enters token → row updated to status='redeemed'.
--   (4) Analytics aggregates redemptions per discount per period.
--
-- Phase 1 hook: referred_sitter_id populated when a partner recommends
-- a sitter to the network — enables partner→sitter growth loop tracking.
-- ------------------------------------------------------------

create table if not exists public.partner_discount_redemptions (
  id uuid primary key default uuid_generate_v4(),
  discount_id uuid not null references public.partner_discounts(id) on delete cascade,
  redeemed_by_owner_id uuid references public.profiles(id) on delete set null,
  redeemed_by_sitter_id uuid references public.profiles(id) on delete set null,
  referred_sitter_id uuid references public.profiles(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  redemption_token text not null unique,
  status text not null default 'issued' check (status in ('issued', 'redeemed', 'expired', 'void')),
  issued_at timestamptz not null default now(),
  redeemed_at timestamptz,
  expires_at timestamptz,
  notes text
);

create index if not exists idx_partner_discount_redemptions_discount on public.partner_discount_redemptions (discount_id);
create index if not exists idx_partner_discount_redemptions_token on public.partner_discount_redemptions (redemption_token);
create index if not exists idx_partner_discount_redemptions_status on public.partner_discount_redemptions (status);
create index if not exists idx_partner_discount_redemptions_issued on public.partner_discount_redemptions (issued_at desc);

alter table public.partner_discount_redemptions enable row level security;

drop policy if exists "Partners see redemptions for their own discounts" on public.partner_discount_redemptions;
create policy "Partners see redemptions for their own discounts"
  on public.partner_discount_redemptions for select
  using (
    exists (
      select 1 from public.partner_discounts pd
      where pd.id = partner_discount_redemptions.discount_id
      and pd.partner_id = auth.uid()
    )
  );

drop policy if exists "Users see their own redemptions" on public.partner_discount_redemptions;
create policy "Users see their own redemptions"
  on public.partner_discount_redemptions for select
  using (
    redeemed_by_owner_id = auth.uid()
    or redeemed_by_sitter_id = auth.uid()
  );

drop policy if exists "Authenticated users can issue a redemption" on public.partner_discount_redemptions;
create policy "Authenticated users can issue a redemption"
  on public.partner_discount_redemptions for insert
  to authenticated
  with check (
    redeemed_by_owner_id = auth.uid()
    or redeemed_by_sitter_id = auth.uid()
  );

drop policy if exists "Partners can mark their discount redemptions" on public.partner_discount_redemptions;
create policy "Partners can mark their discount redemptions"
  on public.partner_discount_redemptions for update
  using (
    exists (
      select 1 from public.partner_discounts pd
      where pd.id = partner_discount_redemptions.discount_id
      and pd.partner_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage all redemptions" on public.partner_discount_redemptions;
create policy "Admins can manage all redemptions"
  on public.partner_discount_redemptions for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ------------------------------------------------------------
-- 6. Admin stats addendum — extend admin_dashboard_stats to include partners.
-- Replaces the function so admin dashboard can surface partner metrics.
-- Uses `return (select ...)` instead of SELECT INTO to avoid parser
-- ambiguity with tools that don't honor dollar-quoting.
-- ------------------------------------------------------------

create or replace function public.admin_dashboard_stats()
returns json
language plpgsql
security definer
as $func$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized';
  end if;

  return (
    select json_build_object(
      'total_users', (select count(*) from public.profiles),
      'total_sitters', (select count(*) from public.sitter_profiles),
      'verified_sitters', (select count(*) from public.sitter_profiles where is_verified = true),
      'pending_verifications', (select count(*) from public.verifications where status = 'pending'),
      'total_bookings', (select count(*) from public.bookings),
      'active_bookings', (select count(*) from public.bookings where status in ('confirmed', 'in_progress')),
      'completed_bookings', (select count(*) from public.bookings where status = 'completed'),
      'total_revenue', (select coalesce(sum(commission_amount), 0) from public.bookings where status = 'completed'),
      'total_payments', (select coalesce(sum(amount), 0) from public.payments where status = 'completed'),
      'active_discounts', (select count(*) from public.partner_discounts where is_active = true),
      'total_reviews', (select count(*) from public.reviews),
      'avg_rating', (select coalesce(round(avg(rating)::numeric, 1), 0) from public.reviews),
      'total_partners', (select count(*) from public.partner_profiles),
      'verified_partners', (select count(*) from public.partner_profiles where is_verified = true),
      'pending_partner_verifications', (select count(*) from public.partner_profiles where is_verified = false),
      'total_discount_redemptions', (select count(*) from public.partner_discount_redemptions where status = 'redeemed')
    )
  );
end;
$func$;
