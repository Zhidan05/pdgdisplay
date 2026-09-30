-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Security Helper in Private Schema
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_rri_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('admin', 'operator')
  );
$$;

-- Grant usage so authenticated users can call the function if necessary internally
GRANT USAGE ON SCHEMA private TO authenticated;

-- Policies for Profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by rri staff" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles are viewable by rri staff" ON public.profiles FOR SELECT TO authenticated USING (private.is_rri_staff());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policies for Stations
DROP POLICY IF EXISTS "Stations are viewable by everyone" ON public.stations;
DROP POLICY IF EXISTS "Stations are insertable by authenticated users" ON public.stations;
DROP POLICY IF EXISTS "Stations are updatable by authenticated users" ON public.stations;
DROP POLICY IF EXISTS "Stations are deletable by authenticated users" ON public.stations;

CREATE POLICY "Stations are viewable by everyone" ON public.stations FOR SELECT USING (true);
CREATE POLICY "Stations are insertable by authenticated users" ON public.stations FOR INSERT TO authenticated WITH CHECK (private.is_rri_staff());
CREATE POLICY "Stations are updatable by authenticated users" ON public.stations FOR UPDATE TO authenticated USING (private.is_rri_staff());
CREATE POLICY "Stations are deletable by authenticated users" ON public.stations FOR DELETE TO authenticated USING (private.is_rri_staff());

-- Policies for Schedules
DROP POLICY IF EXISTS "Active schedules are viewable by everyone" ON public.schedules;
DROP POLICY IF EXISTS "Schedules are insertable by authenticated users" ON public.schedules;
DROP POLICY IF EXISTS "Schedules are updatable by authenticated users" ON public.schedules;
DROP POLICY IF EXISTS "Schedules are deletable by authenticated users" ON public.schedules;

CREATE POLICY "Active schedules are viewable by everyone" ON public.schedules FOR SELECT USING (is_active = true OR private.is_rri_staff());
CREATE POLICY "Schedules are insertable by authenticated users" ON public.schedules FOR INSERT TO authenticated WITH CHECK (private.is_rri_staff());
CREATE POLICY "Schedules are updatable by authenticated users" ON public.schedules FOR UPDATE TO authenticated USING (private.is_rri_staff());
CREATE POLICY "Schedules are deletable by authenticated users" ON public.schedules FOR DELETE TO authenticated USING (private.is_rri_staff());

-- Policies for Infos
DROP POLICY IF EXISTS "Active infos are viewable by everyone" ON public.infos;
DROP POLICY IF EXISTS "Infos are insertable by authenticated users" ON public.infos;
DROP POLICY IF EXISTS "Infos are updatable by authenticated users" ON public.infos;
DROP POLICY IF EXISTS "Infos are deletable by authenticated users" ON public.infos;

CREATE POLICY "Active infos are viewable by everyone" ON public.infos FOR SELECT USING (is_active = true OR private.is_rri_staff());
CREATE POLICY "Infos are insertable by authenticated users" ON public.infos FOR INSERT TO authenticated WITH CHECK (private.is_rri_staff());
CREATE POLICY "Infos are updatable by authenticated users" ON public.infos FOR UPDATE TO authenticated USING (private.is_rri_staff());
CREATE POLICY "Infos are deletable by authenticated users" ON public.infos FOR DELETE TO authenticated USING (private.is_rri_staff());

-- Policies for Running Texts
DROP POLICY IF EXISTS "Active running texts are viewable by everyone" ON public.running_texts;
DROP POLICY IF EXISTS "Running texts are insertable by authenticated users" ON public.running_texts;
DROP POLICY IF EXISTS "Running texts are updatable by authenticated users" ON public.running_texts;
DROP POLICY IF EXISTS "Running texts are deletable by authenticated users" ON public.running_texts;

CREATE POLICY "Active running texts are viewable by everyone" ON public.running_texts FOR SELECT USING (is_active = true OR private.is_rri_staff());
CREATE POLICY "Running texts are insertable by authenticated users" ON public.running_texts FOR INSERT TO authenticated WITH CHECK (private.is_rri_staff());
CREATE POLICY "Running texts are updatable by authenticated users" ON public.running_texts FOR UPDATE TO authenticated USING (private.is_rri_staff());
CREATE POLICY "Running texts are deletable by authenticated users" ON public.running_texts FOR DELETE TO authenticated USING (private.is_rri_staff());

-- Policies for Settings
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.settings;
DROP POLICY IF EXISTS "Settings are insertable by authenticated users" ON public.settings;
DROP POLICY IF EXISTS "Settings are updatable by authenticated users" ON public.settings;
DROP POLICY IF EXISTS "Settings are deletable by authenticated users" ON public.settings;

CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Settings are insertable by authenticated users" ON public.settings FOR INSERT TO authenticated WITH CHECK (private.is_rri_staff());
CREATE POLICY "Settings are updatable by authenticated users" ON public.settings FOR UPDATE TO authenticated USING (private.is_rri_staff());
CREATE POLICY "Settings are deletable by authenticated users" ON public.settings FOR DELETE TO authenticated USING (private.is_rri_staff());

-- Storage Policies
-- Assuming 'storage.objects' is the table where Storage policies are applied.
DROP POLICY IF EXISTS "Anyone can read rri-content" ON storage.objects;
DROP POLICY IF EXISTS "Staff can insert into rri-content" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update rri-content" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete from rri-content" ON storage.objects;

CREATE POLICY "Anyone can read rri-content" ON storage.objects FOR SELECT USING (bucket_id = 'rri-content');
CREATE POLICY "Staff can insert into rri-content" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rri-content' AND private.is_rri_staff());
CREATE POLICY "Staff can update rri-content" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'rri-content' AND private.is_rri_staff());
CREATE POLICY "Staff can delete from rri-content" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'rri-content' AND private.is_rri_staff());

-- Database Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Storage bucket setup
INSERT INTO storage.buckets (id, name, public) VALUES ('rri-content', 'rri-content', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view rri-content" ON storage.objects FOR SELECT USING (bucket_id = 'rri-content');
CREATE POLICY "Authenticated users can upload to rri-content" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rri-content');
CREATE POLICY "Authenticated users can update rri-content" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'rri-content');
CREATE POLICY "Authenticated users can delete rri-content" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'rri-content');
