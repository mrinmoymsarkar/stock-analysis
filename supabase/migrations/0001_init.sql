-- Watchlist table
create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbols text[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- RLS
alter table public.watchlists enable row level security;

create policy "Users can read own watchlist"
  on public.watchlists for select
  using (auth.uid() = user_id);

create policy "Users can upsert own watchlist"
  on public.watchlists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own watchlist"
  on public.watchlists for update
  using (auth.uid() = user_id);

create policy "Users can delete own watchlist"
  on public.watchlists for delete
  using (auth.uid() = user_id);
