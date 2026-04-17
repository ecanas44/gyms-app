-- Add explicit membership plan type to avoid name-based plan behavior.

alter table public.membership_types
  add column if not exists plan_type text;

update public.membership_types
set plan_type = case
  when lower(name) like '%punch%' then 'punch_card'
  when lower(name) like '%day pass%' or lower(name) like '%daypass%' or lower(name) like '%pase%' then 'day_pass'
  when lower(name) like '%annual%' or lower(name) like '%anual%' or lower(name) like '%year%' then 'annual'
  when lower(name) like '%bimonth%' or lower(name) like '%bi-month%' or lower(name) like '%bimens%' then 'bimonthly'
  when lower(name) like '%month%' or lower(name) like '%mensual%' then 'monthly'
  else 'custom'
end
where plan_type is null;

alter table public.membership_types
  alter column plan_type set default 'custom';

alter table public.membership_types
  alter column plan_type set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'membership_types_plan_type_check'
      and conrelid = 'public.membership_types'::regclass
  ) then
    alter table public.membership_types
      add constraint membership_types_plan_type_check
      check (plan_type in ('monthly', 'punch_card', 'day_pass', 'annual', 'bimonthly', 'custom'));
  end if;
end$$;
