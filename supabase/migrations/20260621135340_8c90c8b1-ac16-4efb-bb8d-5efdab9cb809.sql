CREATE TABLE public.toistuvat_kulut (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiinteisto_id uuid NOT NULL REFERENCES public.kiinteistot(id) ON DELETE CASCADE,
  nimi text NOT NULL,
  kategoria text NOT NULL DEFAULT 'muu',
  summa numeric NOT NULL DEFAULT 0,
  eraantymiskuukausi smallint NOT NULL DEFAULT 1 CHECK (eraantymiskuukausi BETWEEN 1 AND 12),
  alkuvuosi int NOT NULL DEFAULT EXTRACT(year FROM now())::int,
  aktiivinen boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_toistuvat_kulut_kiinteisto ON public.toistuvat_kulut(kiinteisto_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.toistuvat_kulut TO authenticated;
GRANT ALL ON public.toistuvat_kulut TO service_role;

ALTER TABLE public.toistuvat_kulut ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Toistuvat select" ON public.toistuvat_kulut FOR SELECT USING (omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "Toistuvat insert" ON public.toistuvat_kulut FOR INSERT WITH CHECK (omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "Toistuvat update" ON public.toistuvat_kulut FOR UPDATE USING (omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "Toistuvat delete" ON public.toistuvat_kulut FOR DELETE USING (omistaa_kiinteiston(kiinteisto_id));

CREATE TRIGGER trg_toistuvat_kulut_updated BEFORE UPDATE ON public.toistuvat_kulut
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.kulu_asetukset
  ADD COLUMN IF NOT EXISTS edellinen_sahkomittari numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS edellinen_sahkomittari_pvm date,
  ADD COLUMN IF NOT EXISTS edellinen_vesimittari_pvm date;