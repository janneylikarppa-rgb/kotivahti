ALTER TABLE public.talon_tiedot
  ADD COLUMN IF NOT EXISTS ilp_merkki text,
  ADD COLUMN IF NOT EXISTS ilp_malli text,
  ADD COLUMN IF NOT EXISTS ilp_asennettu_vuosi integer;