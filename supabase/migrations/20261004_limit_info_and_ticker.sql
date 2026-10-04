-- Migration: Enforce maximum 10 items limit for Info Terbaru (latest_info) and Running Text (running_texts)
-- Includes advisory transaction locks to safely handle concurrent requests.

BEGIN;

-- 1. Trigger function for Info Terbaru limit (max 10)
CREATE OR REPLACE FUNCTION public.check_info_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_type = 'latest_info' THEN
    -- Serialize concurrent insert transactions on latest_info
    PERFORM pg_advisory_xact_lock(hashtext('infos_latest_info_limit'));
    
    IF (
      SELECT count(*)
      FROM public.infos
      WHERE display_type = 'latest_info'
    ) >= 10 THEN
      RAISE EXCEPTION 'Batas maksimum 10 Info Terbaru telah tercapai. Hapus salah satu data untuk menambahkan data baru.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_info_limit ON public.infos;
CREATE TRIGGER tr_check_info_limit
  BEFORE INSERT ON public.infos
  FOR EACH ROW EXECUTE FUNCTION public.check_info_limit();

-- 2. Trigger function for Running Text limit (max 10)
CREATE OR REPLACE FUNCTION public.check_running_text_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Serialize concurrent insert transactions on running_texts
  PERFORM pg_advisory_xact_lock(hashtext('running_texts_limit'));

  IF (
    SELECT count(*)
    FROM public.running_texts
  ) >= 10 THEN
    RAISE EXCEPTION 'Batas maksimum 10 Running Text telah tercapai. Hapus salah satu data untuk menambahkan data baru.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_running_text_limit ON public.running_texts;
CREATE TRIGGER tr_check_running_text_limit
  BEFORE INSERT ON public.running_texts
  FOR EACH ROW EXECUTE FUNCTION public.check_running_text_limit();

COMMIT;
