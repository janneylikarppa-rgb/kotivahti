ALTER TABLE public.liidit ADD COLUMN IF NOT EXISTS maakunta text;
ALTER TABLE public.ammattilaiset ADD COLUMN IF NOT EXISTS toimialueet text[] NOT NULL DEFAULT '{}'::text[];