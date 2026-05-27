
-- App role enum + user_roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Omat roolit luetaan" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Liidit
CREATE TABLE public.liidit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kiinteisto_id uuid NOT NULL,
  palvelu text NOT NULL,
  kategoria text NOT NULL,
  kuvaus text,
  nimi text NOT NULL,
  puhelin text NOT NULL,
  sahkoposti text NOT NULL,
  ajoitus text NOT NULL,
  lisatieto text,
  osoite text,
  rakennus_vuosi integer,
  lammitys text,
  pts_kohde text,
  status text NOT NULL DEFAULT 'odottaa',
  lahetetty_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.liidit TO authenticated;
GRANT ALL ON public.liidit TO service_role;
ALTER TABLE public.liidit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Omat liidit select" ON public.liidit FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Omat liidit insert" ON public.liidit FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin liidi update" ON public.liidit FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin liidi delete" ON public.liidit FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_liidit_updated BEFORE UPDATE ON public.liidit FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Ammattilaiset
CREATE TABLE public.ammattilaiset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kategoria text NOT NULL,
  yritys text NOT NULL,
  sahkoposti text NOT NULL,
  puhelin text,
  aktiivinen boolean NOT NULL DEFAULT true,
  prioriteetti integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ammattilaiset TO authenticated;
GRANT ALL ON public.ammattilaiset TO service_role;
ALTER TABLE public.ammattilaiset ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin ammattilaiset select" ON public.ammattilaiset FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin ammattilaiset insert" ON public.ammattilaiset FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin ammattilaiset update" ON public.ammattilaiset FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin ammattilaiset delete" ON public.ammattilaiset FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_amm_updated BEFORE UPDATE ON public.ammattilaiset FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Liidi-asetukset (singleton)
CREATE TABLE public.liidi_asetukset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automaatio_paalla boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.liidi_asetukset TO authenticated;
GRANT ALL ON public.liidi_asetukset TO service_role;
ALTER TABLE public.liidi_asetukset ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin asetukset select" ON public.liidi_asetukset FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin asetukset insert" ON public.liidi_asetukset FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin asetukset update" ON public.liidi_asetukset FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_asetukset_updated BEFORE UPDATE ON public.liidi_asetukset FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.liidi_asetukset (automaatio_paalla) VALUES (false);
