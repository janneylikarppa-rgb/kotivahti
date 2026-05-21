
-- Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS puhelin text;

-- Kiinteistot
ALTER TABLE public.kiinteistot ADD COLUMN IF NOT EXISTS hankintatapa text;
ALTER TABLE public.kiinteistot ADD COLUMN IF NOT EXISTS hankinta_vuosi integer;

-- Talon tiedot
ALTER TABLE public.talon_tiedot
  ADD COLUMN IF NOT EXISTS kokonaispinta_ala numeric,
  ADD COLUMN IF NOT EXISTS perustus text,
  ADD COLUMN IF NOT EXISTS eriste text,
  ADD COLUMN IF NOT EXISTS rakennus_lisatieto text,
  ADD COLUMN IF NOT EXISTS katto_pinta_ala numeric,
  ADD COLUMN IF NOT EXISTS hormit text,
  ADD COLUMN IF NOT EXISTS kattoturvatuotteet text,
  ADD COLUMN IF NOT EXISTS kourun_pituus numeric,
  ADD COLUMN IF NOT EXISTS kourun_materiaali text,
  ADD COLUMN IF NOT EXISTS syoksytorvet integer,
  ADD COLUMN IF NOT EXISTS iv_suodatintyyppi text,
  ADD COLUMN IF NOT EXISTS iv_suodatin_vaihdettu date,
  ADD COLUMN IF NOT EXISTS paasulun_sijainti text,
  ADD COLUMN IF NOT EXISTS palovaroittimia integer,
  ADD COLUMN IF NOT EXISTS palovaroitin_paristot date,
  ADD COLUMN IF NOT EXISTS kiukaan_vuosi integer,
  ADD COLUMN IF NOT EXISTS nuohous_pvm date,
  ADD COLUMN IF NOT EXISTS nurmikon_pinta_ala numeric,
  ADD COLUMN IF NOT EXISTS sadevesikaivot integer,
  ADD COLUMN IF NOT EXISTS terassi_pinta_ala numeric,
  ADD COLUMN IF NOT EXISTS terassi_rakennettu_vuosi integer,
  ADD COLUMN IF NOT EXISTS salaojat boolean,
  ADD COLUMN IF NOT EXISTS salaojat_tarkastettu date;

-- Dokumentit
CREATE TABLE IF NOT EXISTS public.talo_dokumentit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiinteisto_id uuid NOT NULL,
  nimi text NOT NULL,
  tyyppi text NOT NULL DEFAULT 'dokumentti',
  tiedosto_polku text NOT NULL,
  mime text,
  koko_bytes integer,
  kuvaus text,
  lisatty_pvm date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.talo_dokumentit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dokumentit select" ON public.talo_dokumentit FOR SELECT USING (public.omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "Dokumentit insert" ON public.talo_dokumentit FOR INSERT WITH CHECK (public.omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "Dokumentit update" ON public.talo_dokumentit FOR UPDATE USING (public.omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "Dokumentit delete" ON public.talo_dokumentit FOR DELETE USING (public.omistaa_kiinteiston(kiinteisto_id));

CREATE INDEX IF NOT EXISTS idx_talo_dokumentit_kiinteisto ON public.talo_dokumentit(kiinteisto_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('talo-dokumentit', 'talo-dokumentit', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Talo-dok select" ON storage.objects FOR SELECT
  USING (bucket_id = 'talo-dokumentit' AND public.omistaa_kiinteiston((storage.foldername(name))[1]::uuid));

CREATE POLICY "Talo-dok insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'talo-dokumentit' AND public.omistaa_kiinteiston((storage.foldername(name))[1]::uuid));

CREATE POLICY "Talo-dok update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'talo-dokumentit' AND public.omistaa_kiinteiston((storage.foldername(name))[1]::uuid));

CREATE POLICY "Talo-dok delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'talo-dokumentit' AND public.omistaa_kiinteiston((storage.foldername(name))[1]::uuid));
