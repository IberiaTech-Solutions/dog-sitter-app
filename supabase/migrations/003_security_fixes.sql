-- SECURITY FIX: Prevent users from changing their own role
-- Drop the old permissive update policy
drop policy if exists "Users can update own profile" on public.profiles;

-- New policy: users can update own profile BUT cannot change role
create policy "Users can update own profile (no role change)" on public.profiles
  for update using (auth.uid() = id)
  with check (role = (select role from public.profiles where id = auth.uid()));

-- SECURITY FIX: Add security headers function note
-- (Headers are configured in next.config.ts, not SQL)

-- SECURITY FIX: Restrict payments insert to service role only
create policy "Only service role can insert payments" on public.payments
  for insert with check (false);  -- No user can insert; only service_role bypasses RLS

-- SECURITY FIX: Restrict audit_log insert to service role only
create policy "Only service role can insert audit logs" on public.audit_log
  for insert with check (false);  -- No user can insert; only service_role bypasses RLS
