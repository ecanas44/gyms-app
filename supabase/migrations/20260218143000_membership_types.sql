-- Membership types management and member linkage

create table if not exists public.membership_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_monthly numeric(10, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_types_name_not_blank check (length(btrim(name)) > 0),
  constraint membership_types_price_nonnegative check (price_monthly is null or price_monthly >= 0)
);

create unique index if not exists membership_types_name_unique_ci
  on public.membership_types ((lower(name)));

create index if not exists membership_types_active_idx
  on public.membership_types (is_active);

create trigger set_membership_types_updated_at
before update on public.membership_types
for each row execute function public.set_updated_at();

insert into public.membership_types (name, price_monthly, is_active)
values
  ('Monthly', null, true),
  ('PunchCard', null, true)
on conflict ((lower(name))) do nothing;

alter table public.members
  add column if not exists membership_type_id uuid references public.membership_types(id) on delete restrict;

update public.members as m
set membership_type_id = mt.id
from public.membership_types as mt
where m.membership_type_id is null
  and (
    lower(mt.name) = lower(m.membership::text)
    or (m.membership::text = 'PunchCard' and lower(mt.name) in ('punchcard', '5 punch card'))
  );

alter table public.members
  alter column membership_type_id set not null;

create index if not exists members_membership_type_id_idx
  on public.members (membership_type_id);

alter table public.members
  drop column if exists membership;

do $$
begin
  if exists (select 1 from pg_type where typname = 'membership_type') then
    drop type public.membership_type;
  end if;
end$$;

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
