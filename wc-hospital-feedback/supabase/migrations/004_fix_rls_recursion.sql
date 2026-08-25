-- ============================================================
-- Western Cape Hospital Feedback System
-- Migration 004 — Fix RLS Recursion
-- ============================================================

-- Create security definer helper function to check admin role safely.
-- Because it runs as SECURITY DEFINER, it executes with the privileges
-- of the creator (db superuser), bypassing RLS and avoiding recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix public.profiles select policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Fix public.feedback select policy
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
CREATE POLICY "Admins can view all feedback"
  ON public.feedback FOR SELECT
  USING (public.is_admin());
