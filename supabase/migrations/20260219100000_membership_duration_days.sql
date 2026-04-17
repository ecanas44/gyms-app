alter table public.membership_types
  add column if not exists duration_days integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'membership_types_duration_days_positive'
  ) then
    alter table public.membership_types
      add constraint membership_types_duration_days_positive
      check (duration_days is null or duration_days > 0);
  end if;
end$$;

update public.membership_types
set duration_days = 30
where duration_days is null
  and lower(name) = 'monthly';
