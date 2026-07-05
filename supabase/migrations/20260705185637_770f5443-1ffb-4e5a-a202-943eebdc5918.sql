ALTER TABLE public.talon_tiedot
  ADD COLUMN IF NOT EXISTS aurinko_tyyppi text,
  ADD COLUMN IF NOT EXISTS aurinko_asennus_vuosi integer;

UPDATE public.talon_tiedot
   SET aurinko_tyyppi = 'paneelit'
 WHERE aurinkopaneelit = true
   AND aurinko_tyyppi IS NULL;