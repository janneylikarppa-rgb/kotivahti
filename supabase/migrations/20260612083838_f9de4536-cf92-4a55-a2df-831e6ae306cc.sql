ALTER TABLE public.talon_tiedot
  ADD COLUMN IF NOT EXISTS hormien_maara integer,
  ADD COLUMN IF NOT EXISTS hormityyppi text,
  ADD COLUMN IF NOT EXISTS kiuas_tyyppi text;