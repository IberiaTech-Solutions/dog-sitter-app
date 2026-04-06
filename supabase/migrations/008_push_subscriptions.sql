create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique (user_id, endpoint)
);

create index idx_push_subscriptions_user on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

create policy "Users can read their own subscriptions"
  on push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on push_subscriptions for delete
  using (auth.uid() = user_id);
