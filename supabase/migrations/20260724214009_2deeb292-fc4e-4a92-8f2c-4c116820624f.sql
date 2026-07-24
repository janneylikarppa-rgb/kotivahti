ALTER TABLE public.huolto_historia
  ADD COLUMN IF NOT EXISTS tyon_osuus numeric,
  ADD COLUMN IF NOT EXISTS kotitalousvahennys_tyyppi text;

ALTER TABLE public.huolto_historia
  ADD CONSTRAINT huolto_historia_ktv_tyyppi_check
  CHECK (kotitalousvahennys_tyyppi IS NULL OR kotitalousvahennys_tyyppi IN ('yritys','palkka'));