ALTER TABLE public.liidit
  ADD COLUMN agentin_ehdotus jsonb,
  ADD COLUMN kasitelty_at timestamptz,
  ADD COLUMN lahetus_jonossa boolean NOT NULL DEFAULT false;