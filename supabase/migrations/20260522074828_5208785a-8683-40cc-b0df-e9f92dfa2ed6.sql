CREATE TABLE public.pts_rivit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiinteisto_id uuid NOT NULL,
  vuosi int NOT NULL,
  kohde text NOT NULL,
  kuvaus text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pts_rivit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PTS rivit select" ON public.pts_rivit FOR SELECT USING (omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "PTS rivit insert" ON public.pts_rivit FOR INSERT WITH CHECK (omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "PTS rivit update" ON public.pts_rivit FOR UPDATE USING (omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "PTS rivit delete" ON public.pts_rivit FOR DELETE USING (omistaa_kiinteiston(kiinteisto_id));
CREATE INDEX idx_pts_rivit_kiinteisto ON public.pts_rivit(kiinteisto_id);

CREATE TABLE public.pts_kuitatut (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiinteisto_id uuid NOT NULL,
  kohde text NOT NULL,
  historia_id uuid,
  kuitattu_pvm date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kiinteisto_id, kohde)
);
ALTER TABLE public.pts_kuitatut ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PTS kuitatut select" ON public.pts_kuitatut FOR SELECT USING (omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "PTS kuitatut insert" ON public.pts_kuitatut FOR INSERT WITH CHECK (omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "PTS kuitatut update" ON public.pts_kuitatut FOR UPDATE USING (omistaa_kiinteiston(kiinteisto_id));
CREATE POLICY "PTS kuitatut delete" ON public.pts_kuitatut FOR DELETE USING (omistaa_kiinteiston(kiinteisto_id));
CREATE INDEX idx_pts_kuitatut_kiinteisto ON public.pts_kuitatut(kiinteisto_id);