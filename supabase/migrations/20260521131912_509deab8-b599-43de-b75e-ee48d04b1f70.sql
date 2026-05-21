ALTER TABLE public.vk_kuitatut
  ADD COLUMN IF NOT EXISTS historia_id uuid REFERENCES public.huolto_historia(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS vk_kuitatut_historia_id_idx ON public.vk_kuitatut (historia_id);