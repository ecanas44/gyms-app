-- Members table with waiver requirement

do $$
begin
  if not exists (select 1 from pg_type where typname = 'membership_type') then
    create type public.membership_type as enum ('Monthly', 'PunchCard');
  end if;
end$$;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  waiver_id uuid not null references public.waivers(id) on delete restrict,
  full_name text not null,
  email text not null,
  phone text,
  membership public.membership_type not null,
  start_date date not null default current_date,
  punches_remaining integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_email_unique unique(email),
  constraint member_email_valid check (position('@' in email) > 1),
  constraint punches_nonnegative check (punches_remaining is null or punches_remaining >= 0)
);

create index if not exists members_full_name_idx on public.members using gin (to_tsvector('simple', full_name));
create index if not exists members_email_idx on public.members (email);
create index if not exists members_membership_idx on public.members (membership);

create trigger set_members_updated_at
before update on public.members
for each row execute procedure public.set_updated_at();

alter table public.members enable row level security;

create policy "Allow authenticated read members"
  on public.members for select
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated insert members"
  on public.members for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated update members"
  on public.members for update
  using (auth.role() = 'authenticated' or auth.role() = 'service_role')
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated delete members"
  on public.members for delete
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');
