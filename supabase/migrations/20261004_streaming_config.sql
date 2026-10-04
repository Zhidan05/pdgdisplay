-- Migration: Add separate columns for YouTube and RRI streaming configuration
-- Preserves existing stream_url for active playback compatibility
BEGIN;

ALTER TABLE public.stations 
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS rri_url TEXT;

COMMENT ON COLUMN public.stations.youtube_url IS 'URL siaran YouTube (Live / Video)';
COMMENT ON COLUMN public.stations.rri_url IS 'URL direct stream audio RRI (MP3 / AAC / etc)';

COMMIT;
