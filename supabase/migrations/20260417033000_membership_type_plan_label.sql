-- Allow gym admins to configure a custom plan type label per membership.

alter table public.membership_types
  add column if not exists plan_label text;

alter table public.membership_types
  drop constraint if exists membership_types_plan_label_not_blank;

alter table public.membership_types
  add constraint membership_types_plan_label_not_blank
  check (plan_label is null or length(btrim(plan_label)) > 0);
