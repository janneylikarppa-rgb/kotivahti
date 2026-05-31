
ALTER TABLE public.liidit DROP COLUMN IF EXISTS ajoitus;
ALTER TABLE public.liidit ADD COLUMN IF NOT EXISTS kaupunki text;
ALTER TABLE public.liidit ALTER COLUMN status SET DEFAULT 'uusi';
