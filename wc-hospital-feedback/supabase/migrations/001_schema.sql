-- ============================================================
-- Western Cape Hospital Feedback System
-- Schema Migration 001
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'patient'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Hospitals ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hospitals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  district    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospitals_district ON public.hospitals(district);

-- ── Feedback ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id),
  category    TEXT NOT NULL CHECK (category IN (
    'Cleanliness', 'Staff Behaviour', 'Waiting Time',
    'Service', 'Facilities', 'Other'
  )),
  comment     TEXT NOT NULL CHECK (char_length(comment) >= 20 AND char_length(comment) <= 2000),
  sentiment   TEXT CHECK (sentiment IN ('Positive', 'Negative', 'Neutral', 'pending', 'failed')),
  issue       TEXT,
  ai_summary  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id      ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_hospital_id  ON public.feedback(hospital_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at   ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_sentiment    ON public.feedback(sentiment);

-- ── Row Level Security ────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback  ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- profiles: admins can view all
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- hospitals: everyone authenticated can read
CREATE POLICY "Authenticated users can view hospitals"
  ON public.hospitals FOR SELECT
  TO authenticated
  USING (true);

-- hospitals: only service role can insert/update
CREATE POLICY "Service role can manage hospitals"
  ON public.hospitals FOR ALL
  USING (auth.role() = 'service_role');

-- feedback: patients can insert own feedback
CREATE POLICY "Patients can insert feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- feedback: patients can view own feedback
CREATE POLICY "Patients can view own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

-- feedback: admins can view all
CREATE POLICY "Admins can view all feedback"
  ON public.feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
