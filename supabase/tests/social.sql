-- Pruebas aisladas: TODOS los usuarios, amistades, salas y premios se revierten.
rollback;
begin;
create temporary table social_test(k text primary key,v jsonb);
grant all on social_test to authenticated;
create function pg_temp.assert_ok(b boolean,label text) returns text language plpgsql as $$
begin if b is distinct from true then raise exception 'TEST FAILED: %',label; end if; return 'PASS: '||label; end $$;
create function pg_temp.reject(q text,wanted text) returns text language plpgsql as $$
begin
 begin execute q; exception when others then
 if position(wanted in sqlerrm)>0 then return 'PASS: rejected '||wanted; end if;
 raise exception 'TEST FAILED: expected %, got %',wanted,sqlerrm;
 end;
 raise exception 'TEST FAILED: unexpectedly allowed %',wanted;
end $$;
create function pg_temp.seed_for(lo float8,hi float8) returns void language plpgsql as $$
declare seed float8; x float8;
begin
 for i in 0..10000 loop seed:=-1+i/5000.0;perform setseed(seed);x:=random()*100;if x>=lo and x<hi then perform setseed(seed);return;end if;end loop;
 raise exception 'no seed';
end $$;
insert into auth.users(id,email) values
('19110000-0000-4000-8000-000000000001','social-transaction-a@example.test'),
('19110000-0000-4000-8000-000000000002','social-transaction-b@example.test'),
('19110000-0000-4000-8000-000000000003','social-transaction-c@example.test'),
('19110000-0000-4000-8000-000000000004','social-transaction-d@example.test'),
('19110000-0000-4000-8000-000000000005','social-transaction-e@example.test');
insert into public.aquarium_saves(user_id,payload) select id,'{"version":1,"coins":650,"food":50,"xp":0,"active":0,"tanks":[{"name":"Acuario de prueba","theme":0,"size":0,"clean":90,"bank":0,"fish":[],"decor":[]}],"inventory":[],"claimed":[],"stats":{},"last":1}'::jsonb from auth.users where id::text like '19110000-%';
select pg_temp.assert_ok(not has_table_privilege('authenticated','public.aquarium_profiles','SELECT'),'no direct profile access');
select pg_temp.assert_ok(not has_function_privilege('anon','public.aquarium_expedition_claim(uuid,bigint)','EXECUTE'),'anonymous rewards denied');
set local role authenticated;
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000001',true);
insert into social_test values('a',public.aquarium_social_home());
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000002',true);
insert into social_test values('b',public.aquarium_social_home());
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000003',true);
select public.aquarium_social_home();
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000004',true);
select public.aquarium_social_home();
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000005',true);
select public.aquarium_social_home();
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000001',true);
select public.aquarium_friend_request((select v->'profile'->>'code' from social_test where k='b'));
select public.aquarium_friend_request((select v->'profile'->>'code' from social_test where k='b'));
insert into social_test values('request',public.aquarium_social_home()->'people'->0);
select pg_temp.assert_ok(jsonb_array_length(public.aquarium_social_home()->'people')=1,'request deduplicated');
select pg_temp.reject('select public.aquarium_visit(''19110000-0000-4000-8000-000000000002'')','friends_only');
select pg_temp.reject('select public.aquarium_friend_action('||(select quote_literal(v->>'id') from social_test where k='request')||',''accept'')','not_allowed');
select pg_temp.reject('select public.aquarium_expedition_create(array[''19110000-0000-4000-8000-000000000002''::uuid])','friends_only');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000003',true);
select pg_temp.reject('select public.aquarium_friend_action('||(select quote_literal(v->>'id') from social_test where k='request')||',''accept'')','not_allowed');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000002',true);
select public.aquarium_friend_action((select (v->>'id')::uuid from social_test where k='request'),'accept');
select public.aquarium_profile_update('Tripulante B',false);
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000001',true);
select pg_temp.reject('select public.aquarium_visit(''19110000-0000-4000-8000-000000000002'')','visits_disabled');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000002',true);
select public.aquarium_profile_update('Tripulante B',true);
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000001',true);
insert into social_test values('visit',public.aquarium_visit('19110000-0000-4000-8000-000000000002'));
select pg_temp.assert_ok((select v ? 'tanks' and not v ? 'coins' and not v ? 'email' and not v ? 'payload' from social_test where k='visit'),'visit only exposes aquarium');
select pg_temp.reject('select public.aquarium_expedition_create(array[]::uuid[])','choose_1_to_4_friends');
select pg_temp.reject('select public.aquarium_expedition_create(array[''19110000-0000-4000-8000-000000000002''::uuid,''19110000-0000-4000-8000-000000000002''::uuid])','choose_1_to_4_friends');
insert into social_test values('e2',to_jsonb(public.aquarium_expedition_create(array['19110000-0000-4000-8000-000000000002'::uuid])));
select pg_temp.reject('select public.aquarium_expedition_action('||(select quote_literal(v#>>'{}') from social_test where k='e2')||',''start'')','need_two_players');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000003',true);
select pg_temp.reject('select public.aquarium_expedition_action('||(select quote_literal(v#>>'{}') from social_test where k='e2')||',''join'')','not_allowed');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000002',true);
select public.aquarium_expedition_action((select (v#>>'{}')::uuid from social_test where k='e2'),'join');
select pg_temp.reject('select public.aquarium_expedition_action('||(select quote_literal(v#>>'{}') from social_test where k='e2')||',''start'')','not_allowed');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000001',true);
select public.aquarium_expedition_action((select (v#>>'{}')::uuid from social_test where k='e2'),'start');
select pg_temp.reject('select public.aquarium_expedition_claim('||(select quote_literal(v#>>'{}') from social_test where k='e2')||',1)','expedition_not_finished');
select pg_temp.reject('select public.aquarium_expedition_create(array[''19110000-0000-4000-8000-000000000002''::uuid])','expedition_busy');
reset role;
select pg_temp.assert_ok((select party_size=2 from public.aquarium_expeditions where id=(select (v#>>'{}')::uuid from social_test where k='e2')),'two confirmed participants sealed');
update public.aquarium_expeditions set finishes_at=now()-interval '1 second' where id=(select (v#>>'{}')::uuid from social_test where k='e2');
set local role authenticated;
select pg_temp.reject('select public.aquarium_expedition_claim('||(select quote_literal(v#>>'{}') from social_test where k='e2')||',0)','save_conflict');
insert into social_test values('r2',public.aquarium_expedition_claim((select (v#>>'{}')::uuid from social_test where k='e2'),1));
select pg_temp.assert_ok((select (v->>'revision')::int=2 from social_test where k='r2'),'reward advances save revision');
select pg_temp.reject('select public.aquarium_expedition_claim('||(select quote_literal(v#>>'{}') from social_test where k='e2')||',2)','already_claimed');
select pg_temp.reject('select public.save_aquarium('||(select quote_literal(v->'payload') from social_test where k='r2')||'::jsonb,1)','save_conflict');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000003',true);
select pg_temp.reject('select public.aquarium_expedition_claim('||(select quote_literal(v#>>'{}') from social_test where k='e2')||',1)','not_participant');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000002',true);
select public.aquarium_expedition_claim((select (v#>>'{}')::uuid from social_test where k='e2'),1);
reset role;
-- Preparar otra salida solo entre las cuentas de esta transacción.
update public.aquarium_expeditions set started_at=now()-interval '25 hours' where id=(select (v#>>'{}')::uuid from social_test where k='e2');
insert into public.aquarium_friendships(sender,recipient,status) select '19110000-0000-4000-8000-000000000001'::uuid,id,'accepted' from auth.users where id in('19110000-0000-4000-8000-000000000003','19110000-0000-4000-8000-000000000004','19110000-0000-4000-8000-000000000005');
set local role authenticated;
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000001',true);
insert into social_test values('e5',to_jsonb(public.aquarium_expedition_create(array['19110000-0000-4000-8000-000000000002'::uuid,'19110000-0000-4000-8000-000000000003'::uuid,'19110000-0000-4000-8000-000000000004'::uuid,'19110000-0000-4000-8000-000000000005'::uuid])));
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000002',true);
select public.aquarium_expedition_action((select (v#>>'{}')::uuid from social_test where k='e5'),'join');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000003',true);
select public.aquarium_expedition_action((select (v#>>'{}')::uuid from social_test where k='e5'),'join');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000004',true);
select public.aquarium_expedition_action((select (v#>>'{}')::uuid from social_test where k='e5'),'join');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000005',true);
select public.aquarium_expedition_action((select (v#>>'{}')::uuid from social_test where k='e5'),'join');
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000001',true);
select public.aquarium_expedition_action((select (v#>>'{}')::uuid from social_test where k='e5'),'start');
reset role;
select pg_temp.assert_ok((select party_size=5 from public.aquarium_expeditions where id=(select (v#>>'{}')::uuid from social_test where k='e5')),'five-player departure');
-- Cubrir las cuatro clases de recompensa sin depender de suerte en la prueba.
insert into public.aquarium_expeditions(id,host,status,started_at,finishes_at,party_size) select ('19112222-0000-4000-8000-00000000000'||i)::uuid,'19110000-0000-4000-8000-000000000004','running',now()-interval '1 hour',now()-interval '1 second',5 from generate_series(1,4) i;
insert into public.aquarium_expedition_members(expedition_id,user_id,status) select ('19112222-0000-4000-8000-00000000000'||i)::uuid,'19110000-0000-4000-8000-000000000004','accepted' from generate_series(1,4) i;
set local role authenticated;
select set_config('request.jwt.claim.sub','19110000-0000-4000-8000-000000000004',true);
select pg_temp.seed_for(50,99);
insert into social_test values('coins',public.aquarium_expedition_claim('19112222-0000-4000-8000-000000000001',1));
select pg_temp.assert_ok((select v->'reward'->>'type'='coins' and (v->'reward'->>'amount')::int=500 and (v->'payload'->>'coins')::int=1150 from social_test where k='coins'),'coin reward added once');
select pg_temp.seed_for(17,45);
insert into social_test values('food',public.aquarium_expedition_claim('19112222-0000-4000-8000-000000000002',2));
select pg_temp.assert_ok((select v->'reward'->>'type'='food' and (v->'payload'->>'food')::int=100 from social_test where k='food'),'food reward added');
select pg_temp.seed_for(0,5);
insert into social_test values('fang',public.aquarium_expedition_claim('19112222-0000-4000-8000-000000000003',3));
select pg_temp.assert_ok((select v->'reward'->>'species'='fang' and jsonb_array_length(v->'payload'->'expeditionFish')=1 from social_test where k='fang'),'vampire fish reserved');
select pg_temp.seed_for(7,15);
insert into social_test values('royal',public.aquarium_expedition_claim('19112222-0000-4000-8000-000000000004',4));
select pg_temp.assert_ok((select v->'reward'->>'species'='royal' and jsonb_array_length(v->'payload'->'expeditionFish')=2 from social_test where k='royal'),'second fish reserved without overwriting first');
reset role;
rollback;
select 'PASS: amigos, privacidad, visitas, equipos de 2 y 5, reloj, revisiones, cuatro premios y rechazo de duplicados. Datos de prueba revertidos.' as result;
