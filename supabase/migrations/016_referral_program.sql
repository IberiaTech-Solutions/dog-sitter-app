-- Referral program: each user gets a code, new users can sign up with it

-- Add referral code to profiles
alter table public.profiles
  add column referral_code text unique,
  add column referred_by uuid references public.profiles(id);

-- Referral credits tracking
create table public.referral_credits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null default 5.00,
  reason text not null check (reason in ('referrer_bonus', 'referred_bonus')),
  related_user_id uuid references public.profiles(id),
  is_used boolean not null default false,
  used_on_booking_id uuid references public.bookings(id),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.referral_credits enable row level security;

create policy "Users can view own credits" on public.referral_credits
  for select using (auth.uid() = user_id);

create policy "System can insert credits" on public.referral_credits
  for insert with check (true);

-- Admins can view all
create policy "Admins can view all credits" on public.referral_credits
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Index
create index idx_referral_credits_user on public.referral_credits(user_id);

-- Generate referral code for existing users
-- (new users get it via the trigger update below)
update public.profiles
set referral_code = upper(substr(md5(id::text || now()::text), 1, 8))
where referral_code is null;

-- Function to generate referral code on new user
create or replace function public.generate_referral_code()
returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(substr(md5(new.id::text || now()::text), 1, 8));
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_referral_code
  before insert on public.profiles
  for each row execute function public.generate_referral_code();
