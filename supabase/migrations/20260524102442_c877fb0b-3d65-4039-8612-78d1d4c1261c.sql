-- ============================================================
-- Kulut <-> Huoltohistoria <-> PTS integraatio
-- ============================================================

-- 1. Lisää linkityskentät olemassa oleviin tauluihin
ALTER TABLE public.huolto_historia
  ADD COLUMN IF NOT EXISTS kohde_avain text,
  ADD COLUMN IF NOT EXISTS kulu_id uuid;

ALTER TABLE public.kulut
  ADD COLUMN IF NOT EXISTS huolto_id uuid,
  ADD COLUMN IF NOT EXISTS kohde_avain text;

CREATE INDEX IF NOT EXISTS idx_huolto_historia_kulu_id ON public.huolto_historia(kulu_id);
CREATE INDEX IF NOT EXISTS idx_kulut_huolto_id ON public.kulut(huolto_id);
CREATE INDEX IF NOT EXISTS idx_huolto_historia_kohde_avain ON public.huolto_historia(kohde_avain);
CREATE INDEX IF NOT EXISTS idx_kulut_kohde_avain ON public.kulut(kohde_avain);

-- 2. Uusi pts_suunnitelma -taulu
CREATE TABLE IF NOT EXISTS public.pts_suunnitelma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiinteisto_id uuid NOT NULL,
  kohde_avain text NOT NULL,
  kohde_nimi text NOT NULL,
  kategoria text NOT NULL,
  kayttoika integer NOT NULL DEFAULT 0,
  huoltovali integer NOT NULL DEFAULT 0,
  lahde_vuosi integer,
  toimenpide_vuosi integer NOT NULL,
  kiireellisyys text NOT NULL DEFAULT 'seurannassa',
  viimeisin_huolto_vuosi integer,
  viimeisin_uusiminen_vuosi integer,
  oma_rivi boolean NOT NULL DEFAULT false,
  kuvaus text,
  paivitetty_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pts_suunnitelma_auto
  ON public.pts_suunnitelma(kiinteisto_id, kohde_avain)
  WHERE oma_rivi = false;

CREATE INDEX IF NOT EXISTS idx_pts_suunnitelma_kiinteisto ON public.pts_suunnitelma(kiinteisto_id);

ALTER TABLE public.pts_suunnitelma ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PTS suunnitelma select" ON public.pts_suunnitelma;
DROP POLICY IF EXISTS "PTS suunnitelma insert" ON public.pts_suunnitelma;
DROP POLICY IF EXISTS "PTS suunnitelma update" ON public.pts_suunnitelma;
DROP POLICY IF EXISTS "PTS suunnitelma delete" ON public.pts_suunnitelma;

CREATE POLICY "PTS suunnitelma select" ON public.pts_suunnitelma
  FOR SELECT USING (public.omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "PTS suunnitelma insert" ON public.pts_suunnitelma
  FOR INSERT WITH CHECK (public.omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "PTS suunnitelma update" ON public.pts_suunnitelma
  FOR UPDATE USING (public.omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "PTS suunnitelma delete" ON public.pts_suunnitelma
  FOR DELETE USING (public.omistaa_kiinteiston(kiinteisto_id));

-- 3. Realtime publication + replica identity
ALTER TABLE public.huolto_historia REPLICA IDENTITY FULL;
ALTER TABLE public.kulut REPLICA IDENTITY FULL;
ALTER TABLE public.pts_suunnitelma REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'huolto_historia'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.huolto_historia';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'kulut'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.kulut';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pts_suunnitelma'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.pts_suunnitelma';
  END IF;
END$$;

-- 4. Migraatio: vanhat pts_rivit -> pts_suunnitelma (oma_rivi=true)
-- Yritetään säilyttää käyttäjän omat PTS-kirjaukset
INSERT INTO public.pts_suunnitelma
  (kiinteisto_id, kohde_avain, kohde_nimi, kategoria, kayttoika, huoltovali,
   toimenpide_vuosi, kiireellisyys, oma_rivi, kuvaus)
SELECT
  r.kiinteisto_id,
  'oma_' || r.id::text AS kohde_avain,
  r.kohde,
  'Muu',
  0, 0,
  r.vuosi,
  CASE
    WHEN r.vuosi - EXTRACT(YEAR FROM now())::int <= 0 THEN 'kiireellinen'
    WHEN r.vuosi - EXTRACT(YEAR FROM now())::int <= 5 THEN 'lahivuosina'
    ELSE 'seurannassa'
  END,
  true,
  r.kuvaus
FROM public.pts_rivit r
ON CONFLICT DO NOTHING;

-- 5. Vanhojen PTS-taulujen poisto (korvataan kokonaan)
DROP TABLE IF EXISTS public.pts_lykkaykset CASCADE;
DROP TABLE IF EXISTS public.pts_kuitatut CASCADE;
DROP TABLE IF EXISTS public.pts_rivit CASCADE;
