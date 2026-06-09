
-- =========================================================
-- 1) palaute_kyselyt
-- =========================================================
CREATE TABLE public.palaute_kyselyt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tyyppi text NOT NULL,
  trigger_id uuid,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  token_voimassa timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  lahetetty_at timestamptz NOT NULL DEFAULT now(),
  vastattu_at timestamptz,
  vastaukset jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX palaute_kyselyt_token_key ON public.palaute_kyselyt(token);
CREATE INDEX palaute_kyselyt_user_tyyppi_idx
  ON public.palaute_kyselyt(user_id, tyyppi, lahetetty_at DESC);
CREATE INDEX palaute_kyselyt_trigger_idx
  ON public.palaute_kyselyt(trigger_id) WHERE trigger_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.palaute_kyselyt TO authenticated;
GRANT ALL ON public.palaute_kyselyt TO service_role;

ALTER TABLE public.palaute_kyselyt ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Omat palautteet select"
  ON public.palaute_kyselyt FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Omat palautteet insert"
  ON public.palaute_kyselyt FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Omat palautteet update"
  ON public.palaute_kyselyt FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin palautteet delete"
  ON public.palaute_kyselyt FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER palaute_kyselyt_updated
  BEFORE UPDATE ON public.palaute_kyselyt
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- 2) kayttaja_metriikat
-- =========================================================
CREATE TABLE public.kayttaja_metriikat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  rekisteroity_at timestamptz NOT NULL DEFAULT now(),
  viimeisin_kirjautuminen timestamptz,
  kirjautumisia integer NOT NULL DEFAULT 0,
  talon_tiedot_taytetty boolean NOT NULL DEFAULT false,
  pts_avattu boolean NOT NULL DEFAULT false,
  liideja_lahetetty integer NOT NULL DEFAULT 0,
  huoltoja_kirjattu integer NOT NULL DEFAULT 0,
  vuosikelloa_kuitattu integer NOT NULL DEFAULT 0,
  nps_pisteet integer,
  nps_annettu_at timestamptz,
  kausikirje_suostumus boolean NOT NULL DEFAULT true,
  paivitetty_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.kayttaja_metriikat TO authenticated;
GRANT ALL ON public.kayttaja_metriikat TO service_role;

ALTER TABLE public.kayttaja_metriikat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Omat metriikat select"
  ON public.kayttaja_metriikat FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Käyttäjä saa päivittää vain kausikirje_suostumus-kentän (rajoitetaan client-puolen päivityksiä yleisellä policylla; sovellus tekee muut päivitykset service_rolella)
CREATE POLICY "Omat metriikat update"
  ON public.kayttaja_metriikat FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER kayttaja_metriikat_updated
  BEFORE UPDATE ON public.kayttaja_metriikat
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- 3) Apufunktio: inkrementoi numero / aseta boolean / merkitse kirjautuminen
-- =========================================================
CREATE OR REPLACE FUNCTION public.inkrementoi_metriikka(
  _user_id uuid,
  _kentta text,
  _maara integer DEFAULT 1
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.kayttaja_metriikat (user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  IF _kentta IN ('liideja_lahetetty','huoltoja_kirjattu','vuosikelloa_kuitattu','kirjautumisia') THEN
    EXECUTE format(
      'UPDATE public.kayttaja_metriikat SET %I = COALESCE(%I,0) + $1, paivitetty_at = now() WHERE user_id = $2',
      _kentta, _kentta
    ) USING _maara, _user_id;
  ELSIF _kentta IN ('talon_tiedot_taytetty','pts_avattu') THEN
    EXECUTE format(
      'UPDATE public.kayttaja_metriikat SET %I = true, paivitetty_at = now() WHERE user_id = $1',
      _kentta
    ) USING _user_id;
  ELSIF _kentta = 'kirjautuminen' THEN
    UPDATE public.kayttaja_metriikat
      SET viimeisin_kirjautuminen = now(),
          kirjautumisia = COALESCE(kirjautumisia,0) + 1,
          paivitetty_at = now()
      WHERE user_id = _user_id;
  ELSE
    RAISE EXCEPTION 'Tuntematon kentta: %', _kentta;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.inkrementoi_metriikka(uuid, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.inkrementoi_metriikka(uuid, text, integer) TO service_role;

-- =========================================================
-- 4) Päivitä handle_new_user lisäämään metriikkarivi
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  insert into public.kayttaja_metriikat (user_id, rekisteroity_at)
  values (new.id, now())
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- =========================================================
-- 5) Backfill: olemassa olevat käyttäjät
-- =========================================================
INSERT INTO public.kayttaja_metriikat (user_id, rekisteroity_at)
SELECT u.id, u.created_at FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;
