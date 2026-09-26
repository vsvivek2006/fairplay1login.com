-- FairPlay Blog Schema for Supabase
-- Run this in your Supabase project SQL Editor (https://supabase.com/dashboard/project/uicpztuhoyfxkjjueymz/sql)

CREATE TABLE IF NOT EXISTS public.fairplay_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content JSONB DEFAULT '[]'::jsonb,
  cover_image TEXT,
  author TEXT DEFAULT 'FairPlay Desk',
  category TEXT DEFAULT 'Cricket Betting',
  status TEXT DEFAULT 'draft',
  ai_generated BOOLEAN DEFAULT true,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  reading_time_minutes INTEGER DEFAULT 5,
  target_site TEXT DEFAULT 'fairplaylive.io', -- Distinguishes fairplaylive.io and other domains in shared database
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration statement if table already exists:
ALTER TABLE public.fairplay_posts ADD COLUMN IF NOT EXISTS target_site TEXT DEFAULT 'fairplaylive.io';

-- High-performance composite indexes
CREATE INDEX IF NOT EXISTS idx_fairplay_posts_slug ON public.fairplay_posts(slug);
CREATE INDEX IF NOT EXISTS idx_fairplay_posts_status ON public.fairplay_posts(status);
CREATE INDEX IF NOT EXISTS idx_fairplay_posts_category ON public.fairplay_posts(category);
CREATE INDEX IF NOT EXISTS idx_fairplay_posts_target_site ON public.fairplay_posts(target_site);
CREATE INDEX IF NOT EXISTS idx_fairplay_posts_status_created ON public.fairplay_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fairplay_posts_created_desc ON public.fairplay_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fairplay_posts_slug_status ON public.fairplay_posts(slug, status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.fairplay_posts ENABLE ROW LEVEL SECURITY;

-- 1. Public / Anon: READ-ONLY access to PUBLISHED articles only (Prevents draft leakage)
DROP POLICY IF EXISTS "Public Read Access" ON public.fairplay_posts;
DROP POLICY IF EXISTS "Full Access Policy" ON public.fairplay_posts;
CREATE POLICY "Public Read Access"
ON public.fairplay_posts FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- 2. Service Role: Strictly protected FULL ACCESS for server backend only
CREATE POLICY "Service Role Only Full Access"
ON public.fairplay_posts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Auto-confirm the admin user created via Supabase Auth
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@fairplaylive.io';
