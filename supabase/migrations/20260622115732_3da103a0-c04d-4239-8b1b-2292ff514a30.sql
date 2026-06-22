
-- Ammattilaisten pisteytys
ALTER TABLE public.ammattilaiset
  ADD COLUMN IF NOT EXISTS keskiarvopisteet numeric(3,2),
  ADD COLUMN IF NOT EXISTS arviomaara integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS viimeisin_arvio timestamptz;

-- Liidin ja ammattilaisen kytkös
ALTER TABLE public.liidit
  ADD COLUMN IF NOT EXISTS ammattilainen_id uuid REFERENCES public.ammattilaiset(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS liidit_ammattilainen_id_idx ON public.liidit(ammattilainen_id);

-- Pisteytyksen laskenta vaiheen 3 vastauksista
CREATE OR REPLACE FUNCTION public.paivita_ammattilainen_pisteet(_amm_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _summa numeric := 0;
  _lkm integer := 0;
  _viimeisin timestamptz := NULL;
  _ka numeric(3,2);
  v_rec RECORD;
  _k1 numeric;
  _k5 numeric;
  _k2 numeric;
  _k3 numeric;
  _k2v jsonb;
BEGIN
  -- Iteroi vaiheen 3 vastaukset liideistä joissa tämä ammattilainen
  FOR v_rec IN
    SELECT pk.vastaukset AS v3, pk.vastattu_at,
           pk.trigger_id AS liidi_id
    FROM public.palaute_kyselyt pk
    WHERE pk.tyyppi = 'ydinprosessi_kokonaiskokemus'
      AND pk.vastattu_at IS NOT NULL
      AND pk.trigger_id IN (SELECT id FROM public.liidit WHERE ammattilainen_id = _amm_id)
  LOOP
    -- Hae vaiheen 2 K2 (kommunikointi-tähdet) samalle liidille
    SELECT vastaukset INTO _k2v
    FROM public.palaute_kyselyt
    WHERE tyyppi = 'ydinprosessi_kaynnin_jalkeen'
      AND trigger_id = v_rec.liidi_id
      AND vastattu_at IS NOT NULL
    ORDER BY vastattu_at DESC LIMIT 1;

    _k1 := COALESCE((v_rec.v3->>'tyo_laatu')::numeric, NULL);
    _k5 := CASE v_rec.v3->>'suosittelu'
             WHEN 'ehdottomasti' THEN 5
             WHEN 'todennakoisesti' THEN 4
             WHEN 'en_osaa' THEN 3
             WHEN 'en_todennakoisesti' THEN 2
             WHEN 'ei_missaan' THEN 1
             ELSE NULL END;
    _k3 := CASE v_rec.v3->>'aikataulu'
             WHEN 'taysin' THEN 5
             WHEN 'lahes' THEN 4
             WHEN 'ei_sovittu' THEN 3
             WHEN 'merkittava' THEN 2
             ELSE NULL END;
    _k2 := COALESCE((_k2v->>'kommunikointi')::numeric, NULL);

    IF _k1 IS NULL OR _k5 IS NULL OR _k3 IS NULL OR _k2 IS NULL THEN
      CONTINUE;
    END IF;

    _summa := _summa + (_k1*0.40 + _k5*0.30 + _k2*0.15 + _k3*0.15);
    _lkm := _lkm + 1;
    IF _viimeisin IS NULL OR v_rec.vastattu_at > _viimeisin THEN
      _viimeisin := v_rec.vastattu_at;
    END IF;
  END LOOP;

  IF _lkm >= 3 THEN
    _ka := ROUND(_summa / _lkm, 2);
    UPDATE public.ammattilaiset
       SET keskiarvopisteet = _ka,
           arviomaara = _lkm,
           viimeisin_arvio = _viimeisin,
           updated_at = now()
     WHERE id = _amm_id;
  ELSE
    UPDATE public.ammattilaiset
       SET arviomaara = _lkm,
           viimeisin_arvio = _viimeisin,
           updated_at = now()
     WHERE id = _amm_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.paivita_ammattilainen_pisteet(uuid) TO authenticated, service_role;
