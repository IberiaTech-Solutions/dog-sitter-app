-- Add admin role to profiles
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('owner', 'sitter', 'both', 'admin'));

-- Admin-only RLS policies: admins can read everything
create policy "Admins can view all bookings" on public.bookings
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all bookings" on public.bookings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can view all payments" on public.payments
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can view all invoices" on public.invoices
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can view all verifications" on public.verifications
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update verifications" on public.verifications
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can view all messages" on public.messages
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can view all visit logs" on public.visit_logs
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can view all consent records" on public.consent_records
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can view all audit logs" on public.audit_log
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can manage partner discounts
create policy "Admins can manage discounts" on public.partner_discounts
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can update sitter profiles (verify/unverify)
create policy "Admins can update sitter profiles" on public.sitter_profiles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Dashboard stats function
create or replace function public.admin_dashboard_stats()
returns json as $$
declare
  result json;
begin
  -- Check admin role
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized';
  end if;

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
    'avg_rating', (select coalesce(round(avg(rating)::numeric, 1), 0) from public.reviews)
  ) into result;

  return result;
end;
$$ language plpgsql security definer;
