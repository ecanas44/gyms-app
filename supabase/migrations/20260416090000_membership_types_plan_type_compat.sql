alter table public.membership_types
  add column if not exists plan_type text generated always as (name) stored;
