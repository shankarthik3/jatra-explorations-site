-- Enable RLS on all new tables
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_points_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;

-- Add new policies for providers
CREATE POLICY "Anyone can view verified providers" ON public.providers
  FOR SELECT USING (verified = true);

CREATE POLICY "Admins can manage all providers" ON public.providers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add policies for experiences
CREATE POLICY "Anyone can view published experiences" ON public.experiences
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage all experiences" ON public.experiences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add policies for experience_slots
CREATE POLICY "Anyone can view active slots" ON public.experience_slots
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage all slots" ON public.experience_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings for themselves" ON public.bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can update all bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add policies for products
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add policies for eco points
CREATE POLICY "Users can view their own eco points" ON public.eco_points_balance
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage eco points" ON public.eco_points_balance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Users can view their own transactions" ON public.eco_points_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create transactions" ON public.eco_points_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all transactions" ON public.eco_points_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add policies for CMS texts
CREATE POLICY "Anyone can view CMS texts" ON public.cms_texts
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage CMS texts" ON public.cms_texts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add policies for media
CREATE POLICY "Anyone can view media" ON public.media
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage media" ON public.media
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews" ON public.reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add policies for admin audit
CREATE POLICY "Admins can view audit logs" ON public.admin_audit
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can create audit logs" ON public.admin_audit
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Add booking transaction function
CREATE OR REPLACE FUNCTION public.create_booking_transaction(
  p_user_id uuid,
  p_experience_id uuid,
  p_slot_id uuid,
  p_participants integer,
  p_total_amount numeric,
  p_eco_points_to_use integer DEFAULT 0
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_booking_id uuid;
  v_balance integer;
BEGIN
  -- Basic checks
  SELECT total_points INTO v_balance FROM public.eco_points_balance WHERE user_id = p_user_id;
  IF p_eco_points_to_use IS NULL THEN
    p_eco_points_to_use := 0;
  END IF;
  IF v_balance IS NULL THEN
    v_balance := 0;
  END IF;
  IF p_eco_points_to_use > v_balance THEN
    RAISE EXCEPTION 'Insufficient Eco Points';
  END IF;

  -- Create booking
  INSERT INTO public.bookings(user_id, experience_id, slot_id, participants, total_amount, status, eco_points_used)
  VALUES (p_user_id, p_experience_id, p_slot_id, p_participants, p_total_amount, 'confirmed', p_eco_points_to_use)
  RETURNING id INTO v_booking_id;

  -- Deduct points (if any)
  IF p_eco_points_to_use > 0 THEN
    UPDATE public.eco_points_balance SET total_points = total_points - p_eco_points_to_use, last_updated = now()
      WHERE user_id = p_user_id;
    INSERT INTO public.eco_points_transactions(user_id, tx_type, points, reference)
      VALUES (p_user_id, 'redeem', -p_eco_points_to_use, v_booking_id);
  END IF;

  -- Increment seats_booked
  UPDATE public.experience_slots SET seats_booked = seats_booked + p_participants WHERE id = p_slot_id;

  RETURN jsonb_build_object('booking_id', v_booking_id, 'status', 'confirmed');
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

-- Insert default CMS content
INSERT INTO public.cms_texts (key, value) VALUES
  ('homepage.hero.title', 'Discover Authentic Jharkhand'),
  ('homepage.hero.subtitle', 'Experience the rich culture, traditions, and natural beauty'),
  ('homepage.about.title', 'About Jatra'),
  ('homepage.about.description', 'Your gateway to authentic cultural experiences in Jharkhand'),
  ('experiences.title', 'Unique Experiences'),
  ('marketplace.title', 'Local Marketplace')
ON CONFLICT (key) DO NOTHING;