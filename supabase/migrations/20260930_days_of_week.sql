-- Migration: Switch day_of_week from TEXT to days_of_week SMALLINT[]

BEGIN;

-- 1. Add the new column
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS days_of_week smallint[] DEFAULT '{}'::smallint[];

-- 2. Migrate existing data
UPDATE public.schedules
SET days_of_week =
  CASE day_of_week
    WHEN 'Setiap hari' THEN '{1,2,3,4,5,6,7}'::smallint[]
    WHEN 'daily' THEN '{1,2,3,4,5,6,7}'::smallint[]
    WHEN '1' THEN '{1}'::smallint[] -- Senin
    WHEN 'Senin' THEN '{1}'::smallint[]
    WHEN '2' THEN '{2}'::smallint[] -- Selasa
    WHEN 'Selasa' THEN '{2}'::smallint[]
    WHEN '3' THEN '{3}'::smallint[]
    WHEN 'Rabu' THEN '{3}'::smallint[]
    WHEN '4' THEN '{4}'::smallint[]
    WHEN 'Kamis' THEN '{4}'::smallint[]
    WHEN '5' THEN '{5}'::smallint[]
    WHEN 'Jumat' THEN '{5}'::smallint[]
    WHEN '6' THEN '{6}'::smallint[] -- Sabtu
    WHEN 'Sabtu' THEN '{6}'::smallint[]
    WHEN '0' THEN '{7}'::smallint[] -- Minggu
    WHEN 'Minggu' THEN '{7}'::smallint[]
    ELSE '{}'::smallint[]
  END;

-- 3. Drop old column
ALTER TABLE public.schedules DROP COLUMN IF EXISTS day_of_week;

-- 4. Create conflict trigger function
CREATE OR REPLACE FUNCTION public.check_schedule_conflict()
RETURNS TRIGGER AS $$
DECLARE
  conflict_record RECORD;
BEGIN
  -- Only validate if the new/updated schedule is active
  IF NEW.is_active = FALSE THEN
    RETURN NEW;
  END IF;

  FOR conflict_record IN
    WITH new_ranges AS (
      SELECT 
        d AS day_num, 
        NEW.start_time AS st, 
        NEW.end_time AS et
      FROM unnest(NEW.days_of_week) AS d
      WHERE NEW.start_time < NEW.end_time
      UNION ALL
      SELECT 
        d AS day_num, 
        NEW.start_time AS st, 
        '24:00:00'::time AS et
      FROM unnest(NEW.days_of_week) AS d
      WHERE NEW.start_time >= NEW.end_time
      UNION ALL
      SELECT 
        (d % 7) + 1 AS day_num, 
        '00:00:00'::time AS st, 
        NEW.end_time AS et
      FROM unnest(NEW.days_of_week) AS d
      WHERE NEW.start_time >= NEW.end_time
    ),
    existing_ranges AS (
      SELECT 
        s.id,
        s.title,
        s.start_time AS orig_st,
        s.end_time AS orig_et,
        s.days_of_week,
        ed AS day_num,
        s.start_time AS st,
        s.end_time AS et
      FROM public.schedules s, unnest(s.days_of_week) AS ed
      WHERE s.station_id = NEW.station_id
        AND s.is_active = TRUE
        AND s.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND s.start_time < s.end_time
      UNION ALL
      SELECT 
        s.id,
        s.title,
        s.start_time AS orig_st,
        s.end_time AS orig_et,
        s.days_of_week,
        ed AS day_num,
        s.start_time AS st,
        '24:00:00'::time AS et
      FROM public.schedules s, unnest(s.days_of_week) AS ed
      WHERE s.station_id = NEW.station_id
        AND s.is_active = TRUE
        AND s.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND s.start_time >= s.end_time
      UNION ALL
      SELECT 
        s.id,
        s.title,
        s.start_time AS orig_st,
        s.end_time AS orig_et,
        s.days_of_week,
        (ed % 7) + 1 AS day_num,
        '00:00:00'::time AS st,
        s.end_time AS et
      FROM public.schedules s, unnest(s.days_of_week) AS ed
      WHERE s.station_id = NEW.station_id
        AND s.is_active = TRUE
        AND s.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND s.start_time >= s.end_time
    )
    SELECT er.id, er.title, er.orig_st, er.orig_et, er.days_of_week, array_agg(DISTINCT er.day_num) as overlapping_days
    FROM new_ranges nr
    JOIN existing_ranges er ON nr.day_num = er.day_num
    WHERE nr.st < er.et AND nr.et > er.st
    GROUP BY er.id, er.title, er.orig_st, er.orig_et, er.days_of_week
    LIMIT 1
  LOOP
    RAISE EXCEPTION 'SCHEDULE_CONFLICT|%|%|%|%|%',
      conflict_record.id,
      conflict_record.title,
      array_to_json(conflict_record.overlapping_days),
      to_char(conflict_record.orig_st, 'HH24:MI'),
      to_char(conflict_record.orig_et, 'HH24:MI');
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_schedule_conflict ON public.schedules;
CREATE TRIGGER tr_check_schedule_conflict
  BEFORE INSERT OR UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.check_schedule_conflict();

COMMIT;
