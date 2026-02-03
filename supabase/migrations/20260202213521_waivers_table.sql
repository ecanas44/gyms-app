-- Waivers module backing table

-- Safely create an enum for the waiver status values used in the UI
do $$
begin
  if not exists (select 1 from pg_type where typname = 'waiver_status') then
    create type public.waiver_status as enum ('Signed', 'Pending', 'Expired');
  end if;
end$$;

create table if not exists public.waivers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  member_name text not null,
  member_email text not null,
  signed_at date not null default current_date,
  status public.waiver_status not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_email_valid check (position('@' in member_email) > 1)
);

create index if not exists waivers_member_name_idx on public.waivers (member_name);
create index if not exists waivers_member_email_idx on public.waivers (member_email);
create index if not exists waivers_signed_at_idx on public.waivers (signed_at);

-- Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_waivers_updated_at
before update on public.waivers
for each row execute function public.set_updated_at();

-- Secure the table and allow app/service usage
alter table public.waivers enable row level security;

create policy "Allow authenticated read waivers"
  on public.waivers for select
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated insert waivers"
  on public.waivers for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated update waivers"
  on public.waivers for update
  using (auth.role() = 'authenticated' or auth.role() = 'service_role')
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated delete waivers"
  on public.waivers for delete
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');
