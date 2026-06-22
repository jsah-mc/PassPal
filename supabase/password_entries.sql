create table if not exists public.password_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  site_name text not null check (char_length(site_name) between 1 and 200),
  username text check (username is null or char_length(username) <= 500),
  encrypted_password text not null,
  iv text not null,
  kdf_salt text not null,
  notes text check (notes is null or char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists password_entries_user_id_created_at_idx
  on public.password_entries (user_id, created_at desc);

alter table public.password_entries enable row level security;

drop policy if exists "Users can read their password entries"
  on public.password_entries;
create policy "Users can read their password entries"
  on public.password_entries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their password entries"
  on public.password_entries;
create policy "Users can create their password entries"
  on public.password_entries
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their password entries"
  on public.password_entries;
create policy "Users can update their password entries"
  on public.password_entries
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their password entries"
  on public.password_entries;
create policy "Users can delete their password entries"
  on public.password_entries
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete
  on table public.password_entries
  to authenticated;

grant usage, select
  on sequence public.password_entries_id_seq
  to authenticated;
