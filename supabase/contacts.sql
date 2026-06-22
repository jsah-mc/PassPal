create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 200),
  last_name text check (last_name is null or char_length(last_name) <= 200),
  email text check (email is null or char_length(email) <= 320),
  phone text check (phone is null or char_length(phone) <= 100),
  company text check (company is null or char_length(company) <= 200),
  notes text check (notes is null or char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_user_name_idx
  on public.contacts (user_id, first_name, last_name);

alter table public.contacts enable row level security;

drop policy if exists "Users can read their contacts"
  on public.contacts;
create policy "Users can read their contacts"
  on public.contacts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their contacts"
  on public.contacts;
create policy "Users can create their contacts"
  on public.contacts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their contacts"
  on public.contacts;
create policy "Users can update their contacts"
  on public.contacts
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their contacts"
  on public.contacts;
create policy "Users can delete their contacts"
  on public.contacts
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete
  on table public.contacts
  to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists set_contacts_updated_at on public.contacts;
create trigger set_contacts_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();
