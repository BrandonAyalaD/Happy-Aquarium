-- Ejecutar una vez en SQL Editor de Supabase.
create table if not exists public.aquarium_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 1000000),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.aquarium_saves enable row level security;
revoke all on public.aquarium_saves from anon, authenticated;
grant select on public.aquarium_saves to authenticated;
drop policy if exists own_save on public.aquarium_saves;
create policy own_save on public.aquarium_saves for select to authenticated using ((select auth.uid()) = user_id);

-- Compare-and-swap: dos dispositivos no sobrescriben silenciosamente la partida.
create or replace function public.save_aquarium(p_payload jsonb, p_revision bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := auth.uid(); current_row public.aquarium_saves; next_revision bigint;
begin
  if owner_id is null then raise exception 'authentication_required'; end if;
  if p_revision is null or p_revision < 0 or jsonb_typeof(p_payload) <> 'object'
     or octet_length(p_payload::text) > 1000000 or p_payload->>'version' <> '1'
     or jsonb_typeof(p_payload->'tanks') <> 'array'
  then raise exception 'invalid_save'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));
  select * into current_row from public.aquarium_saves where user_id = owner_id for update;
  if found then
    if current_row.revision <> p_revision then raise exception 'save_conflict'; end if;
    next_revision := current_row.revision + 1;
    update public.aquarium_saves set payload = p_payload, revision = next_revision, updated_at = now() where user_id = owner_id;
  else
    if p_revision <> 0 then raise exception 'save_conflict'; end if;
    next_revision := 1;
    insert into public.aquarium_saves(user_id, payload, revision) values(owner_id, p_payload, next_revision);
  end if;
  return jsonb_build_object('revision', next_revision);
end $$;
revoke all on function public.save_aquarium(jsonb, bigint) from public;
grant execute on function public.save_aquarium(jsonb, bigint) to authenticated;
