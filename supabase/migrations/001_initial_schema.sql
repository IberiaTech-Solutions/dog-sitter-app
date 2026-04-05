-- CuidaMascotas — Initial Database Schema
-- Run this in your Supabase SQL editor (EU Frankfurt region)

-- Enable required extensions
create extension if not exists "postgis";  -- For GPS/geolocation
create extension if not exists "uuid-ossp";

-- ===========================================
-- USERS & PROFILES
-- ===========================================

-- Extend Supabase auth.users with app-specific profile data
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'sitter', 'both')),
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  locale text not null default 'es' check (locale in ('es', 'en')),
  city text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sitter-specific profile data
create table public.sitter_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  hourly_rate numeric(6,2) not null,
  services text[] not null default '{}',  -- e.g. {'dog_walking', 'pet_sitting', 'drop_in', 'overnight'}
  pet_types text[] not null default '{}', -- e.g. {'dog', 'cat', 'bird', 'other'}
  experience_years int,
  location geography(Point, 4326),        -- PostGIS point for geospatial queries
  address text,
  radius_km int not null default 10,       -- Service radius in km
  is_available boolean not null default true,
  is_verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===========================================
-- VERIFICATION & COMPLIANCE
-- ===========================================

create table public.verifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('dni_nie', 'background_check', 'address')),
  status text not null default 'pending' check (status in ('pending', 'submitted', 'approved', 'rejected')),
  document_url text,
  provider_reference text,  -- External ID from Persona/Checkr
  notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- GDPR consent tracking
create table public.consent_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null,  -- e.g. 'terms_v1', 'privacy_v1', 'marketing'
  granted boolean not null,
  ip_address inet,
  granted_at timestamptz not null default now()
);

-- ===========================================
-- PETS
-- ===========================================

create table public.pets (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  species text not null check (species in ('dog', 'cat', 'bird', 'rabbit', 'other')),
  breed text,
  age_years int,
  weight_kg numeric(5,2),
  microchip_id text,
  medical_notes text,
  special_instructions text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===========================================
-- BOOKINGS
-- ===========================================

create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  sitter_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  service_type text not null check (service_type in ('dog_walking', 'pet_sitting', 'drop_in', 'overnight')),
  status text not null default 'requested' check (status in ('requested', 'accepted', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')),
  start_date timestamptz not null,
  end_date timestamptz not null,
  daily_rate numeric(6,2) not null,
  total_amount numeric(8,2) not null,
  commission_amount numeric(8,2) not null,
  commission_rate numeric(4,2) not null default 0.18, -- 18% default
  owner_notes text,
  cancellation_reason text,
  cancelled_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===========================================
-- PAYMENTS & INVOICES
-- ===========================================

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payer_id uuid not null references public.profiles(id),
  amount numeric(8,2) not null,
  currency text not null default 'EUR',
  method text not null check (method in ('stripe', 'bizum')),
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references public.payments(id),
  invoice_number text not null unique,  -- Sequential: CM-2026-0001
  issuer_nif text,
  recipient_nif text,
  subtotal numeric(8,2) not null,
  iva_rate numeric(4,2) not null default 0.21, -- 21% IVA
  iva_amount numeric(8,2) not null,
  total numeric(8,2) not null,
  pdf_url text,
  created_at timestamptz not null default now()
);

-- ===========================================
-- VISIT LOGS (GPS, Photos, Health)
-- ===========================================

create table public.visit_logs (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sitter_id uuid not null references public.profiles(id),
  event_type text not null check (event_type in ('check_in', 'check_out', 'photo', 'video', 'health_note', 'location_update')),
  location geography(Point, 4326),
  note text,
  media_url text,
  created_at timestamptz not null default now()
);

-- ===========================================
-- REVIEWS
-- ===========================================

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  reviewee_id uuid not null references public.profiles(id),
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  language text not null default 'es',
  discount_code_id uuid,
  created_at timestamptz not null default now(),
  unique(booking_id, reviewer_id)  -- One review per person per booking
);

-- ===========================================
-- MESSAGES
-- ===========================================

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ===========================================
-- PARTNER DISCOUNTS
-- ===========================================

create table public.partner_discounts (
  id uuid primary key default uuid_generate_v4(),
  partner_name text not null,
  partner_type text not null check (partner_type in ('vet', 'pet_shop', 'grooming', 'other')),
  discount_code text not null unique,
  discount_percent int not null check (discount_percent > 0 and discount_percent <= 100),
  description_es text not null,
  description_en text,
  city text not null,
  is_active boolean not null default true,
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

-- ===========================================
-- AUDIT LOG (GDPR compliance)
-- ===========================================

create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,       -- e.g. 'profile.update', 'booking.create', 'data.export'
  resource_type text not null,
  resource_id uuid,
  ip_address inet,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Geospatial index for sitter location searches
create index idx_sitter_profiles_location on public.sitter_profiles using gist(location);

-- Common query indexes
create index idx_bookings_owner on public.bookings(owner_id);
create index idx_bookings_sitter on public.bookings(sitter_id);
create index idx_bookings_status on public.bookings(status);
create index idx_messages_recipient on public.messages(recipient_id, read_at);
create index idx_visit_logs_booking on public.visit_logs(booking_id);
create index idx_reviews_reviewee on public.reviews(reviewee_id);
create index idx_audit_log_user on public.audit_log(user_id, created_at);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

alter table public.profiles enable row level security;
alter table public.sitter_profiles enable row level security;
alter table public.verifications enable row level security;
alter table public.consent_records enable row level security;
alter table public.pets enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;
alter table public.visit_logs enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.partner_discounts enable row level security;
alter table public.audit_log enable row level security;

-- Profiles: anyone can read, only own profile can update
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Sitter profiles: anyone can read available sitters, only own can update
create policy "Sitter profiles viewable by everyone" on public.sitter_profiles for select using (true);
create policy "Sitters can update own profile" on public.sitter_profiles for update using (auth.uid() = id);
create policy "Sitters can insert own profile" on public.sitter_profiles for insert with check (auth.uid() = id);

-- Pets: owner can CRUD, sitters with active booking can read
create policy "Owners can manage own pets" on public.pets for all using (auth.uid() = owner_id);
create policy "Sitters can view pets for their bookings" on public.pets for select using (
  exists (
    select 1 from public.bookings
    where bookings.pet_id = pets.id
    and bookings.sitter_id = auth.uid()
    and bookings.status in ('accepted', 'confirmed', 'in_progress')
  )
);

-- Bookings: owner and sitter can view their own bookings
create policy "Users can view own bookings" on public.bookings for select using (
  auth.uid() = owner_id or auth.uid() = sitter_id
);
create policy "Owners can create bookings" on public.bookings for insert with check (auth.uid() = owner_id);
create policy "Booking participants can update" on public.bookings for update using (
  auth.uid() = owner_id or auth.uid() = sitter_id
);

-- Messages: sender and recipient can view
create policy "Users can view own messages" on public.messages for select using (
  auth.uid() = sender_id or auth.uid() = recipient_id
);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Recipients can mark as read" on public.messages for update using (auth.uid() = recipient_id);

-- Visit logs: booking participants can view, sitter can insert
create policy "Booking participants can view visit logs" on public.visit_logs for select using (
  exists (
    select 1 from public.bookings
    where bookings.id = visit_logs.booking_id
    and (bookings.owner_id = auth.uid() or bookings.sitter_id = auth.uid())
  )
);
create policy "Sitters can create visit logs" on public.visit_logs for insert with check (auth.uid() = sitter_id);

-- Reviews: anyone can read, only booking participants can write
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Booking participants can write reviews" on public.reviews for insert with check (
  exists (
    select 1 from public.bookings
    where bookings.id = reviews.booking_id
    and (bookings.owner_id = auth.uid() or bookings.sitter_id = auth.uid())
    and bookings.status = 'completed'
  )
);

-- Verifications: only own records
create policy "Users can view own verifications" on public.verifications for select using (auth.uid() = user_id);
create policy "Users can submit verifications" on public.verifications for insert with check (auth.uid() = user_id);

-- Consent records: only own
create policy "Users can view own consent" on public.consent_records for select using (auth.uid() = user_id);
create policy "Users can grant consent" on public.consent_records for insert with check (auth.uid() = user_id);

-- Payments & invoices: booking participants only
create policy "Booking participants can view payments" on public.payments for select using (
  exists (
    select 1 from public.bookings
    where bookings.id = payments.booking_id
    and (bookings.owner_id = auth.uid() or bookings.sitter_id = auth.uid())
  )
);
create policy "Booking participants can view invoices" on public.invoices for select using (
  exists (
    select 1 from public.payments
    join public.bookings on bookings.id = payments.booking_id
    where payments.id = invoices.payment_id
    and (bookings.owner_id = auth.uid() or bookings.sitter_id = auth.uid())
  )
);

-- Partner discounts: everyone can view active ones
create policy "Active discounts viewable by everyone" on public.partner_discounts for select using (is_active = true);

-- Audit log: only viewable by the user themselves
create policy "Users can view own audit log" on public.audit_log for select using (auth.uid() = user_id);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger sitter_profiles_updated_at before update on public.sitter_profiles
  for each row execute function public.handle_updated_at();
create trigger pets_updated_at before update on public.pets
  for each row execute function public.handle_updated_at();
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.handle_updated_at();

-- Create profile on signup (triggered by Supabase auth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'owner'),
    coalesce(new.raw_user_meta_data->>'locale', 'es')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Find nearby sitters (PostGIS)
create or replace function public.find_nearby_sitters(
  lat double precision,
  lng double precision,
  radius_meters int default 10000
)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  hourly_rate numeric,
  services text[],
  pet_types text[],
  is_verified boolean,
  distance_meters double precision
) as $$
begin
  return query
  select
    p.id,
    p.full_name,
    p.avatar_url,
    sp.hourly_rate,
    sp.services,
    sp.pet_types,
    sp.is_verified,
    ST_Distance(sp.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_meters
  from public.sitter_profiles sp
  join public.profiles p on p.id = sp.id
  where sp.is_available = true
    and ST_DWithin(sp.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
  order by distance_meters asc;
end;
$$ language plpgsql;
