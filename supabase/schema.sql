-- TABLE: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: stations
CREATE TABLE IF NOT EXISTS public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT,
  tagline TEXT,
  stream_url TEXT,
  logo_path TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: schedules
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  presenter TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week SMALLINT[] DEFAULT '{}',
  specific_date DATE,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: infos
CREATE TABLE IF NOT EXISTS public.infos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  aspect_ratio TEXT CHECK (aspect_ratio IN ('instagram_landscape', 'instagram_portrait', 'landscape_16_9', 'portrait_9_16', '16:9', '9:16', 'instagram-landscape', 'instagram-portrait')),
  display_type TEXT NOT NULL DEFAULT 'latest_info' CHECK (display_type IN ('main_poster', 'latest_info')),
  published_at DATE,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: running_texts
CREATE TABLE IF NOT EXISTS public.running_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: settings
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime Setup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'stations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stations;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'schedules'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'infos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.infos;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'running_texts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.running_texts;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
  END IF;
END $$;

-- Trigger Function for Schedule Conflicts
CREATE OR REPLACE FUNCTION public.check_schedule_conflict()
RETURNS TRIGGER AS $$
DECLARE
  conflict_record RECORD;
BEGIN
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
