-- Add configurable plan fields for membership types.

alter table public.membership_types
  add column if not exists description text,
  add column if not exists duration_days integer,
  add column if not exists included_punches integer;

alter table public.membership_types
  drop constraint if exists membership_types_duration_days_nonnegative;

alter table public.membership_types
  add constraint membership_types_duration_days_nonnegative
  check (duration_days is null or duration_days >= 0);

alter table public.membership_types
  drop constraint if exists membership_types_included_punches_nonnegative;

alter table public.membership_types
  add constraint membership_types_included_punches_nonnegative
  check (included_punches is null or included_punches >= 0);
