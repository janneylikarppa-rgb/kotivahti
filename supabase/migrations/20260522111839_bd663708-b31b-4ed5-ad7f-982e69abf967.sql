ALTER TABLE public.talon_tiedot 
  ADD COLUMN IF NOT EXISTS ikkunat_tyyppi TEXT,
  ADD COLUMN IF NOT EXISTS ikkunat_uusittu_vuosi INTEGER;