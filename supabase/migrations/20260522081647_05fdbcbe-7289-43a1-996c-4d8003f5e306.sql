ALTER TABLE public.kulu_asetukset
  ADD COLUMN IF NOT EXISTS sahko_perusmaksu_eur_kk numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vesi_perusmaksu_eur_kk numeric DEFAULT 0;