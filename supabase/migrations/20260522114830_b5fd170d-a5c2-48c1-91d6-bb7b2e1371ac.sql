ALTER TABLE public.talon_tiedot
  ADD COLUMN IF NOT EXISTS terassi_lasitettu boolean,
  ADD COLUMN IF NOT EXISTS terassi_lasitus_vuosi integer;