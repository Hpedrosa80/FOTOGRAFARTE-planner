-- Run this once in Supabase SQL Editor
create table if not exists public.planner_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists planner_state_set_updated_at on public.planner_state;
create trigger planner_state_set_updated_at
before update on public.planner_state
for each row
execute function public.set_updated_at();

-- For this app (no login), allow anon read/write.
-- If you want stricter security later, switch to authenticated users and add auth.
alter table public.planner_state disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.planner_state to anon, authenticated;
