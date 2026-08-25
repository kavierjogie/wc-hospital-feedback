-- ============================================================
-- Western Cape Hospital Feedback System
-- Migration 005 — Fix Profiles RLS Policy Recursion
-- ============================================================

-- Drop the recursive SELECT policy on public.profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate the SELECT policy on public.profiles with recursion protection.
-- By checking id != auth.uid(), we prevent evaluating is_admin() on the
-- admin's own profile row inside the is_admin() function subquery itself.
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING ( (id != auth.uid()) AND public.is_admin() );
