-- Insert Default Stations
INSERT INTO public.stations (code, name, frequency, tagline, stream_url, logo_path, sort_order) VALUES
('PRO1', 'RRI PRO 1 PADANG', '95.9 FM', 'Kanal informasi & inspirasi', '/media/studio-demo.webm', '/rri/pro1.png', 1),
('PRO2', 'RRI PRO 2 PADANG', '90.8 FM', 'Suara kreativitas anak muda', NULL, '/rri/pro2.png', 2),
('PRO4', 'RRI PRO 4 PADANG', '92.4 FM', 'Suara budaya Nusantara', NULL, '/rri/pro4.png', 4)
ON CONFLICT (code) DO NOTHING;

-- Insert Settings
INSERT INTO public.settings (key, value) VALUES
('station_name', 'RRI PADANG'),
('board_title', 'Radio Republik Indonesia'),
('timezone', 'Asia/Jakarta'),
('fallback_image', '/rri/studio.jpg')
ON CONFLICT (key) DO NOTHING;

-- Insert seed Infos
INSERT INTO public.infos (title, description, image_url, aspect_ratio, display_type, published_at, sort_order, is_active) VALUES
('RRI Padang Memperoleh Penghargaan Keterbukaan Informasi', 'RRI Padang mendapatkan apresiasi tertinggi dalam melayani masyarakat dengan informasi yang transparan.', '/images/info-demo-1.jpg', 'landscape_16_9', 'latest_info', CURRENT_DATE, 1, true),
('Penyiar RRI Padang Temu Ramah Bersama Pendengar Setia', 'Acara temu kangen penyiar RRI PRO 2 Padang bersama para pendengar setia berlangsung meriah di auditorium RRI Padang.', '/images/info-demo-2.jpg', 'landscape_16_9', 'latest_info', CURRENT_DATE, 2, true),
(NULL, NULL, '/images/poster-demo.jpg', 'landscape_16_9', 'main_poster', CURRENT_DATE, 3, true);

-- Insert seed Running Text
INSERT INTO public.running_texts (text, sort_order, is_active) VALUES
('Selamat datang di stasiun RRI Padang. Sekali di udara, tetap di udara.', 1, true),
('Dengarkan terus siaran inspiratif dari PRO 1, PRO 2, dan PRO 4 RRI Padang.', 2, true);

-- Insert seed Schedules (Depends on station IDs, so we use a subquery to find them)
DO $$
DECLARE
  pro1_id UUID;
  pro2_id UUID;
  pro4_id UUID;
BEGIN
  SELECT id INTO pro1_id FROM public.stations WHERE code = 'PRO1';
  SELECT id INTO pro2_id FROM public.stations WHERE code = 'PRO2';
  SELECT id INTO pro4_id FROM public.stations WHERE code = 'PRO4';

  IF pro1_id IS NOT NULL THEN
    INSERT INTO public.schedules (station_id, title, presenter, start_time, end_time, day_of_week) VALUES
    (pro1_id, 'Padang Pagi Ini', 'Budi Santoso', '05:30', '09:00', 'daily'),
    (pro1_id, 'Dinamika Olahraga', 'Rio Pratama', '15:00', '16:00', 'daily');
  END IF;

  IF pro2_id IS NOT NULL THEN
    INSERT INTO public.schedules (station_id, title, presenter, start_time, end_time, day_of_week) VALUES
    (pro2_id, 'Sore Ceria', 'Siti Rahma', '16:00', '18:00', 'daily');
  END IF;

  IF pro4_id IS NOT NULL THEN
    INSERT INTO public.schedules (station_id, title, presenter, start_time, end_time, day_of_week) VALUES
    (pro4_id, 'Apresiasi Budaya Minang', 'Dt. Rajo Mantari', '20:00', '22:00', 'daily');
  END IF;
END $$;
