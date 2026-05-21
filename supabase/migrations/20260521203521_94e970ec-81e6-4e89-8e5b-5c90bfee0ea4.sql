
-- Muuta pts_siirto boolean -> integer (vuotta jolla PTS-suositusta siirretään)
ALTER TABLE public.huolto_historia
  ALTER COLUMN pts_siirto DROP DEFAULT;

ALTER TABLE public.huolto_historia
  ALTER COLUMN pts_siirto TYPE integer
  USING CASE WHEN pts_siirto IS TRUE THEN 1 ELSE 0 END;

ALTER TABLE public.huolto_historia
  ALTER COLUMN pts_siirto SET DEFAULT 0;

-- Linkki huoltomerkinnän liitteistä dokumenttiarkistoon
ALTER TABLE public.talo_dokumentit
  ADD COLUMN IF NOT EXISTS huolto_id uuid;

CREATE INDEX IF NOT EXISTS talo_dokumentit_huolto_id_idx
  ON public.talo_dokumentit(huolto_id);
