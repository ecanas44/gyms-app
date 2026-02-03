-- Check-ins table to track visits from members or one-day waivers

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  waiver_id uuid not null references public.waivers(id) on delete cascade,
  source text generated always as (
    case when member_id is null then 'WaiverOnly' else 'Member' end
  ) stored,
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists check_ins_checked_in_at_idx on public.check_ins (checked_in_at desc);
create index if not exists check_ins_member_id_idx on public.check_ins (member_id);
create index if not exists check_ins_waiver_id_idx on public.check_ins (waiver_id);

alter table public.check_ins enable row level security;

create policy "Allow authenticated read check-ins"
  on public.check_ins for select
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated insert check-ins"
  on public.check_ins for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

create policy "Allow authenticated delete check-ins"
  on public.check_ins for delete
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');
