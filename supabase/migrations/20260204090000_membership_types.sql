-- Membership types for billing

create table if not exists public.membership_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_monthly numeric(10, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists membership_types_name_unique
  on public.membership_types (lower(name));

create index if not exists membership_types_active_idx
  on public.membership_types (is_active);

create trigger set_membership_types_updated_at
before update on public.membership_types
for each row execute function public.set_updated_at();

alter table public.membership_types enable row level security;

create policy "Allow authenticated read membership types"
  on public.membership_types for select
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated insert membership types"
  on public.membership_types for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated update membership types"
  on public.membership_types for update
  using (auth.role() = 'authenticated' or auth.role() = 'service_role')
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated delete membership types"
  on public.membership_types for delete
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

insert into public.membership_types (name, price_monthly, is_active)
select 'Monthly', 89, true
where not exists (
  select 1 from public.membership_types where lower(name) = lower('Monthly')
);

insert into public.membership_types (name, price_monthly, is_active)
select 'PunchCard', null, true
where not exists (
  select 1 from public.membership_types where lower(name) = lower('PunchCard')
);

alter table public.members
  add column if not exists membership_type_id uuid;

update public.members
set membership_type_id = (
  select id from public.membership_types
  where lower(name) = lower(public.members.membership::text)
)
where membership_type_id is null;

alter table public.members
  alter column membership_type_id set not null;

alter table public.members
  add constraint members_membership_type_id_fkey
  foreign key (membership_type_id)
  references public.membership_types(id)
  on delete restrict;

create index if not exists members_membership_type_id_idx
  on public.members (membership_type_id);

alter table public.members
  drop column if exists membership;

do $$
begin
  if exists (select 1 from pg_type where typname = 'membership_type') then
    drop type public.membership_type;
  end if;
end $$;
