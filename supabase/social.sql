-- Amigos, visitas y expediciones. Ejecutar después de schema.sql.
begin;
create table if not exists public.aquarium_profiles (
 user_id uuid primary key references auth.users on delete cascade,
 code text not null unique default ('AF-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 name text not null default 'Marinero' check (char_length(name) between 2 and 30),
 visits boolean not null default true
);
create table if not exists public.aquarium_friendships (
 id uuid primary key default gen_random_uuid(), sender uuid not null references auth.users on delete cascade,
 recipient uuid not null references auth.users on delete cascade, status text not null default 'pending' check(status in ('pending','accepted')),
 created_at timestamptz not null default now(), check(sender <> recipient)
);
create unique index if not exists friendship_pair on public.aquarium_friendships(least(sender,recipient),greatest(sender,recipient));
create table if not exists public.aquarium_expeditions (
 id uuid primary key default gen_random_uuid(), host uuid not null references auth.users on delete cascade,
 status text not null default 'lobby' check(status in ('lobby','running','cancelled')),
 created_at timestamptz not null default now(), started_at timestamptz, finishes_at timestamptz, party_size int
);
create table if not exists public.aquarium_expedition_members (
 expedition_id uuid references public.aquarium_expeditions on delete cascade,
 user_id uuid references auth.users on delete cascade,
 status text not null check(status in ('invited','accepted','declined')),
 reward jsonb, claimed_at timestamptz, primary key(expedition_id,user_id)
);
alter table public.aquarium_profiles enable row level security;
alter table public.aquarium_friendships enable row level security;
alter table public.aquarium_expeditions enable row level security;
alter table public.aquarium_expedition_members enable row level security;
revoke all on public.aquarium_profiles,public.aquarium_friendships,public.aquarium_expeditions,public.aquarium_expedition_members from anon,authenticated;

create or replace function public.aquarium_social_home() returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); result jsonb;
begin
 if me is null then raise exception 'authentication_required'; end if;
 insert into public.aquarium_profiles(user_id) values(me) on conflict do nothing;
 select jsonb_build_object('now',now(),'profile',(select to_jsonb(p)-'user_id' from public.aquarium_profiles p where p.user_id=me),
 'people',coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'user_id',p.user_id,'name',p.name,'code',p.code,'visits',p.visits,'status',f.status,'incoming',f.recipient=me) order by f.created_at)
 from public.aquarium_friendships f join public.aquarium_profiles p on p.user_id=case when f.sender=me then f.recipient else f.sender end where me in(f.sender,f.recipient)),'[]'::jsonb),
 'expeditions',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'host',e.host,'host_name',p.name,'status',e.status,'created_at',e.created_at,'finishes_at',e.finishes_at,'party_size',e.party_size,'my_status',m.status,'claimed',m.claimed_at is not null,'reward',m.reward,
 'members',(select jsonb_agg(jsonb_build_object('id',mp.user_id,'name',mp.name,'status',em.status)) from public.aquarium_expedition_members em join public.aquarium_profiles mp on mp.user_id=em.user_id where em.expedition_id=e.id)) order by e.created_at desc)
 from public.aquarium_expeditions e join public.aquarium_expedition_members m on m.expedition_id=e.id join public.aquarium_profiles p on p.user_id=e.host
 where m.user_id=me and ((e.status='lobby' and e.created_at>now()-interval '24 hours' and m.status<>'declined') or (e.status='running' and m.status='accepted' and (m.claimed_at is null or e.started_at>now()-interval '24 hours')))),'[]'::jsonb),
 'next_departure',(select max(e.started_at)+interval '24 hours' from public.aquarium_expeditions e join public.aquarium_expedition_members m on m.expedition_id=e.id where m.user_id=me and m.status='accepted' and e.status='running')) into result;
 return result;
end $$;

create or replace function public.aquarium_profile_update(p_name text,p_visits boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'authentication_required'; end if;
 if p_name is null or char_length(trim(p_name)) not between 2 and 30 or p_visits is null then raise exception 'invalid_profile'; end if;
 insert into public.aquarium_profiles(user_id,name,visits) values(auth.uid(),trim(p_name),p_visits)
 on conflict(user_id) do update set name=excluded.name,visits=excluded.visits;
end $$;

create or replace function public.aquarium_friend_request(p_code text) returns void
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); target uuid;
begin
 if me is null then raise exception 'authentication_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(me::text,2));
 insert into public.aquarium_profiles(user_id) values(me) on conflict do nothing;
 select user_id into target from public.aquarium_profiles where code=upper(trim(p_code));
 if target is null then raise exception 'code_not_found'; end if;
 if target=me then raise exception 'cannot_friend_self'; end if;
 if (select count(*) from public.aquarium_friendships where sender=me and status='pending')>=20 then raise exception 'too_many_requests'; end if;
 insert into public.aquarium_friendships(sender,recipient) values(me,target) on conflict do nothing;
end $$;

create or replace function public.aquarium_friend_action(p_id uuid,p_action text) returns void
language plpgsql security definer set search_path='' as $$
declare f public.aquarium_friendships;
begin
 if auth.uid() is null then raise exception 'authentication_required'; end if;
 select * into f from public.aquarium_friendships where id=p_id for update;
 if not found or auth.uid() not in(f.sender,f.recipient) then raise exception 'not_allowed'; end if;
 if p_action='accept' and f.status='pending' and f.recipient=auth.uid() then update public.aquarium_friendships set status='accepted' where id=p_id;
 elsif p_action='remove' then delete from public.aquarium_friendships where id=p_id;
 else raise exception 'not_allowed'; end if;
end $$;

create or replace function public.aquarium_visit(p_friend uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception 'authentication_required'; end if;
 if not exists(select 1 from public.aquarium_friendships where status='accepted' and ((sender=auth.uid() and recipient=p_friend) or (recipient=auth.uid() and sender=p_friend))) then raise exception 'friends_only'; end if;
 if not exists(select 1 from public.aquarium_profiles where user_id=p_friend and visits) then raise exception 'visits_disabled'; end if;
 select jsonb_build_object('name',p.name,'tanks',coalesce((select jsonb_agg(jsonb_build_object('name',t->>'name','clean',t->'clean','size',t->'size','theme',t->'theme','substrate',t->'substrate','bank',0,
 'fish',coalesce(t->'fish','[]'::jsonb),'decor',coalesce(t->'decor','[]'::jsonb))) from jsonb_array_elements(s.payload->'tanks') t),'[]'::jsonb)) into result
 from public.aquarium_profiles p join public.aquarium_saves s on s.user_id=p.user_id where p.user_id=p_friend;
 if result is null then raise exception 'no_saved_aquarium'; end if;
 return result;
end $$;

create or replace function public.aquarium_expedition_create(p_friends uuid[]) returns uuid
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); eid uuid; friend uuid;
begin
 if me is null then raise exception 'authentication_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(me::text,1));
 if p_friends is null or cardinality(p_friends) not between 1 and 4 or cardinality(p_friends)<>(select count(distinct x) from unnest(p_friends) x) then raise exception 'choose_1_to_4_friends'; end if;
 if exists(select 1 from public.aquarium_expeditions e join public.aquarium_expedition_members m on m.expedition_id=e.id where m.user_id=me and ((e.status='lobby' and e.created_at>now()-interval '24 hours' and e.host=me) or (e.status='running' and m.status='accepted' and (m.claimed_at is null or e.started_at>now()-interval '24 hours')))) then raise exception 'expedition_busy'; end if;
 foreach friend in array p_friends loop
 if friend is null or not exists(select 1 from public.aquarium_friendships where status='accepted' and ((sender=me and recipient=friend) or (recipient=me and sender=friend))) then raise exception 'friends_only'; end if;
 end loop;
 insert into public.aquarium_expeditions(host) values(me) returning id into eid;
 insert into public.aquarium_expedition_members values(eid,me,'accepted',null,null);
 insert into public.aquarium_expedition_members(expedition_id,user_id,status) select eid,x,'invited' from unnest(p_friends) x;
 return eid;
end $$;

create or replace function public.aquarium_expedition_action(p_id uuid,p_action text) returns void
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); e public.aquarium_expeditions; n int; participant uuid;
begin
 if me is null then raise exception 'authentication_required'; end if;
 select * into e from public.aquarium_expeditions where id=p_id for update;
 if not found or e.status<>'lobby' or e.created_at<=now()-interval '24 hours' then raise exception 'lobby_closed'; end if;
 if p_action='cancel' and e.host=me then update public.aquarium_expeditions set status='cancelled' where id=p_id; return; end if;
 if p_action in('join','decline') and e.host<>me and exists(select 1 from public.aquarium_expedition_members where expedition_id=p_id and user_id=me and status='invited') then
 if p_action='join' and not exists(select 1 from public.aquarium_friendships where status='accepted' and ((sender=me and recipient=e.host) or (recipient=me and sender=e.host))) then raise exception 'friends_only'; end if;
 update public.aquarium_expedition_members set status=case when p_action='join' then 'accepted' else 'declined' end where expedition_id=p_id and user_id=me; return;
 end if;
 if p_action='leave' and e.host<>me then update public.aquarium_expedition_members set status='declined' where expedition_id=p_id and user_id=me and status='accepted'; return; end if;
 if p_action<>'start' or e.host<>me then raise exception 'not_allowed'; end if;
 select count(*) into n from public.aquarium_expedition_members where expedition_id=p_id and status='accepted';
 if n not between 2 and 5 then raise exception 'need_two_players'; end if;
 for participant in select user_id from public.aquarium_expedition_members where expedition_id=p_id and status='accepted' order by user_id loop
 perform pg_advisory_xact_lock(hashtextextended(participant::text,1));
 if participant<>me and not exists(select 1 from public.aquarium_friendships where status='accepted' and ((sender=me and recipient=participant) or (recipient=me and sender=participant))) then raise exception 'friends_only'; end if;
 if exists(select 1 from public.aquarium_expeditions ex join public.aquarium_expedition_members m on m.expedition_id=ex.id where m.user_id=participant and m.status='accepted' and ex.status='running' and (ex.started_at>now()-interval '24 hours' or m.claimed_at is null)) then raise exception 'participant_on_cooldown'; end if;
 end loop;
 update public.aquarium_expeditions set status='running',started_at=now(),finishes_at=now()+interval '15 minutes',party_size=n where id=p_id;
 update public.aquarium_expedition_members set status='declined' where expedition_id=p_id and status='invited';
end $$;

create or replace function public.aquarium_expedition_claim(p_id uuid,p_revision bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); e public.aquarium_expeditions; m public.aquarium_expedition_members; s public.aquarium_saves;
 v_reward jsonb; v_payload jsonb; roll double precision; rare int; special int; amount int;
begin
 if me is null then raise exception 'authentication_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(me::text,0));
 select * into e from public.aquarium_expeditions where id=p_id;
 if not found or e.status<>'running' or now()<e.finishes_at then raise exception 'expedition_not_finished'; end if;
 select * into m from public.aquarium_expedition_members where expedition_id=p_id and user_id=me for update;
 if not found or m.status<>'accepted' then raise exception 'not_participant'; end if;
 if m.claimed_at is not null then raise exception 'already_claimed'; end if;
 select * into s from public.aquarium_saves where user_id=me for update;
 if not found then raise exception 'save_first'; end if;
 if p_revision is null or s.revision<>p_revision then raise exception 'save_conflict'; end if;
 v_payload:=s.payload; roll:=random()*100;
 rare:=case e.party_size when 2 then 1 when 3 then 2 when 4 then 4 else 6 end;
 special:=case e.party_size when 2 then 4 when 3 then 6 when 4 then 8 else 10 end;
 if roll<rare+special then
 v_reward:=jsonb_build_object('type','fish','species',case when roll<rare then 'fang' else 'royal' end,'amount',1);
 v_payload:=jsonb_set(v_payload,'{expeditionFish}',coalesce(v_payload->'expeditionFish','[]'::jsonb)||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'species',v_reward->>'species')));
 elsif roll<rare+special+30 then
 amount:=25+e.party_size*5;v_reward:=jsonb_build_object('type','food','amount',amount);
 v_payload:=jsonb_set(v_payload,'{food}',to_jsonb(coalesce((v_payload->>'food')::numeric,0)+amount));
 else
 amount:=250+e.party_size*50;v_reward:=jsonb_build_object('type','coins','amount',amount);
 v_payload:=jsonb_set(v_payload,'{coins}',to_jsonb(coalesce((v_payload->>'coins')::numeric,0)+amount));
 end if;
 update public.aquarium_expedition_members set reward=v_reward,claimed_at=now() where expedition_id=p_id and user_id=me;
 update public.aquarium_saves set payload=v_payload,revision=s.revision+1,updated_at=now() where user_id=me;
 return jsonb_build_object('reward',v_reward,'payload',v_payload,'revision',s.revision+1);
end $$;

-- Supabase asigna permisos por defecto: revocarlos explícitamente para visitantes.
revoke all on function public.aquarium_social_home(),public.aquarium_profile_update(text,boolean),public.aquarium_friend_request(text),public.aquarium_friend_action(uuid,text),public.aquarium_visit(uuid),public.aquarium_expedition_create(uuid[]),public.aquarium_expedition_action(uuid,text),public.aquarium_expedition_claim(uuid,bigint) from public,anon,authenticated;
grant execute on function public.aquarium_social_home(),public.aquarium_profile_update(text,boolean),public.aquarium_friend_request(text),public.aquarium_friend_action(uuid,text),public.aquarium_visit(uuid),public.aquarium_expedition_create(uuid[]),public.aquarium_expedition_action(uuid,text),public.aquarium_expedition_claim(uuid,bigint) to authenticated;
commit;
