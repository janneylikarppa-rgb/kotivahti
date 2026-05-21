alter table public.talon_tiedot
  add column if not exists viemarimateriaali text,
  add column if not exists viemari_asennettu_vuosi integer,
  add column if not exists sahkot_asennettu_vuosi integer,
  add column if not exists terassi_materiaali text,
  add column if not exists terassi_kunnostettu_vuosi integer;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  uusi_kiinteisto_id uuid;
  kayttajan_nimi text;
begin
  kayttajan_nimi := coalesce(
    new.raw_user_meta_data->>'nimi',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, nimi, email)
  values (new.id, kayttajan_nimi, new.email);

  insert into public.kiinteistot (user_id, nimi, tyyppi)
  values (new.id, kayttajan_nimi, 'omakotitalo')
  returning id into uusi_kiinteisto_id;

  insert into public.talon_tiedot (kiinteisto_id) values (uusi_kiinteisto_id);
  insert into public.kulu_asetukset (kiinteisto_id) values (uusi_kiinteisto_id);

  return new;
end;
$function$;