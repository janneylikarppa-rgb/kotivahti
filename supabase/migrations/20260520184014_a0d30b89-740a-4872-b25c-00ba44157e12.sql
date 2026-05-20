
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nimi text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Omat profiilit luetaan" on public.profiles for select using (auth.uid() = id);
create policy "Omat profiilit paivitetaan" on public.profiles for update using (auth.uid() = id);
create policy "Omat profiilit luodaan" on public.profiles for insert with check (auth.uid() = id);

-- KIINTEISTOT
create table public.kiinteistot (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nimi text,
  osoite text,
  postinumero text,
  kaupunki text,
  tyyppi text default 'omakotitalo',
  rakennusvuosi int,
  aktiivinen boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.kiinteistot enable row level security;
create policy "Omat kiinteistot select" on public.kiinteistot for select using (auth.uid() = user_id);
create policy "Omat kiinteistot insert" on public.kiinteistot for insert with check (auth.uid() = user_id);
create policy "Omat kiinteistot update" on public.kiinteistot for update using (auth.uid() = user_id);
create policy "Omat kiinteistot delete" on public.kiinteistot for delete using (auth.uid() = user_id);

-- Apufunktio omistuksen tarkistukseen
create or replace function public.omistaa_kiinteiston(_kiinteisto_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.kiinteistot where id = _kiinteisto_id and user_id = auth.uid())
$$;

-- TALON_TIEDOT (yksi per kiinteistö)
create table public.talon_tiedot (
  id uuid primary key default gen_random_uuid(),
  kiinteisto_id uuid not null unique references public.kiinteistot(id) on delete cascade,
  -- perustiedot
  pinta_ala numeric,
  tilavuus numeric,
  kerroksia int,
  asukkaita int,
  -- rakennus
  rakennustapa text,
  julkisivumateriaali text,
  julkisivu_maalattu_vuosi int,
  -- katto
  kattotyyppi text,
  kattomateriaali text,
  katto_uusittu_vuosi int,
  raystaat_kunnostettu_vuosi int,
  -- tekniset
  lammitysmuoto text,
  lammitys_asennettu_vuosi int,
  lammitys_lisatieto jsonb default '{}'::jsonb,
  ilmanvaihto text,
  ilmanvaihto_vuosi int,
  putket_uusittu_vuosi int,
  putkimateriaali text,
  viemari_uusittu_vuosi int,
  sahkot_uusittu_vuosi int,
  -- ulkoalueet
  tontin_pinta_ala numeric,
  pihan_tyyppi text,
  piha_lisatieto text,
  -- lomakkeen edistyminen (1-6)
  valmiit_osiot jsonb default '[]'::jsonb,
  data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.talon_tiedot enable row level security;
create policy "Talon tiedot select" on public.talon_tiedot for select using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Talon tiedot insert" on public.talon_tiedot for insert with check (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Talon tiedot update" on public.talon_tiedot for update using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Talon tiedot delete" on public.talon_tiedot for delete using (public.omistaa_kiinteiston(kiinteisto_id));

-- HUOLTO_HISTORIA
create table public.huolto_historia (
  id uuid primary key default gen_random_uuid(),
  kiinteisto_id uuid not null references public.kiinteistot(id) on delete cascade,
  tyyppi text not null,
  kategoria text,
  kohde text,
  kuvaus text,
  pvm date not null,
  tekija text default 'itse',
  tekija_nimi text,
  kustannus numeric default 0,
  takuu_vuotta int default 0,
  pts_siirto boolean default false,
  created_at timestamptz not null default now()
);
alter table public.huolto_historia enable row level security;
create policy "Huolto select" on public.huolto_historia for select using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Huolto insert" on public.huolto_historia for insert with check (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Huolto update" on public.huolto_historia for update using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Huolto delete" on public.huolto_historia for delete using (public.omistaa_kiinteiston(kiinteisto_id));

-- KULUT
create table public.kulut (
  id uuid primary key default gen_random_uuid(),
  kiinteisto_id uuid not null references public.kiinteistot(id) on delete cascade,
  nimi text,
  kategoria text not null default 'muu',
  summa numeric not null default 0,
  pvm date not null,
  kwh numeric,
  mittarilukema numeric,
  kulutus_m3 numeric,
  kuvaus text,
  created_at timestamptz not null default now()
);
alter table public.kulut enable row level security;
create policy "Kulut select" on public.kulut for select using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Kulut insert" on public.kulut for insert with check (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Kulut update" on public.kulut for update using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Kulut delete" on public.kulut for delete using (public.omistaa_kiinteiston(kiinteisto_id));

-- KULU_ASETUKSET
create table public.kulu_asetukset (
  id uuid primary key default gen_random_uuid(),
  kiinteisto_id uuid not null unique references public.kiinteistot(id) on delete cascade,
  sahko_energia_snt numeric default 10,
  sahko_siirto_snt numeric default 5,
  vesi_puhdas_eur_m3 numeric default 2.5,
  vesi_jatevesi_eur_m3 numeric default 3.5,
  edellinen_mittarilukema numeric,
  updated_at timestamptz not null default now()
);
alter table public.kulu_asetukset enable row level security;
create policy "Asetukset select" on public.kulu_asetukset for select using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Asetukset insert" on public.kulu_asetukset for insert with check (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Asetukset update" on public.kulu_asetukset for update using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "Asetukset delete" on public.kulu_asetukset for delete using (public.omistaa_kiinteiston(kiinteisto_id));

-- VK_KUITATUT
create table public.vk_kuitatut (
  id uuid primary key default gen_random_uuid(),
  kiinteisto_id uuid not null references public.kiinteistot(id) on delete cascade,
  kausi_key text not null,
  huolto_nimi text not null,
  vuosi int not null,
  tekija text,
  hinta numeric default 0,
  kuitattu_pvm date not null default current_date,
  created_at timestamptz not null default now(),
  unique (kiinteisto_id, kausi_key, huolto_nimi, vuosi)
);
alter table public.vk_kuitatut enable row level security;
create policy "VK select" on public.vk_kuitatut for select using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "VK insert" on public.vk_kuitatut for insert with check (public.omistaa_kiinteiston(kiinteisto_id));
create policy "VK update" on public.vk_kuitatut for update using (public.omistaa_kiinteiston(kiinteisto_id));
create policy "VK delete" on public.vk_kuitatut for delete using (public.omistaa_kiinteiston(kiinteisto_id));

-- Trigger: uusi käyttäjä -> profiili + oletuskiinteistö + kulu_asetukset
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  uusi_kiinteisto_id uuid;
begin
  insert into public.profiles (id, nimi, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nimi', split_part(new.email, '@', 1)), new.email);

  insert into public.kiinteistot (user_id, nimi, tyyppi)
  values (new.id, 'Oma talo', 'omakotitalo')
  returning id into uusi_kiinteisto_id;

  insert into public.talon_tiedot (kiinteisto_id) values (uusi_kiinteisto_id);
  insert into public.kulu_asetukset (kiinteisto_id) values (uusi_kiinteisto_id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Apufunktio updated_at päivitykseen
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_kiinteistot_updated before update on public.kiinteistot for each row execute function public.set_updated_at();
create trigger trg_talon_tiedot_updated before update on public.talon_tiedot for each row execute function public.set_updated_at();
create trigger trg_kulu_asetukset_updated before update on public.kulu_asetukset for each row execute function public.set_updated_at();
