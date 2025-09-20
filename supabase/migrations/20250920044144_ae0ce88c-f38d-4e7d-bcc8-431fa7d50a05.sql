-- Fix security vulnerability: Remove overly permissive policy that allows any authenticated user to read all bookings
-- This policy overrides the more restrictive "Users can view their own bookings" policy
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.bookings;

-- Keep the secure policies:
-- - "Users can view their own bookings" (user_id = auth.uid())
-- - "Admins can view all bookings" (admin role check)
-- - "Users can create bookings" (user_id = auth.uid())
-- - "Admins can update all bookings" (admin role check)