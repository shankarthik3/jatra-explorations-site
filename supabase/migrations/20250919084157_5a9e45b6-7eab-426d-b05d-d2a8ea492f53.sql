-- Enable RLS on all tables
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

-- RLS Policies for profiles (extend existing)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies for providers
CREATE POLICY "Anyone can view verified providers" ON public.providers
  FOR SELECT USING (verified = true);

CREATE POLICY "Admins can manage all providers" ON public.providers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Provider owners can manage their provider" ON public.providers
  FOR ALL USING (
    owner_profile_id = auth.uid()
  );

-- RLS Policies for experiences
CREATE POLICY "Anyone can view published experiences" ON public.experiences
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage all experiences" ON public.experiences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Providers can manage their experiences" ON public.experiences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p 
             WHERE p.id = auth.uid() AND p.role = 'provider' AND p.provider_id = provider_id)
  );

-- RLS Policies for experience_slots
CREATE POLICY "Anyone can view active slots" ON public.experience_slots
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage all slots" ON public.experience_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies for bookings
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

-- RLS Policies for products
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies for eco points
CREATE POLICY "Users can view their own eco points" ON public.eco_points_balance
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all eco points" ON public.eco_points_balance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

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

-- RLS Policies for CMS texts
CREATE POLICY "Anyone can view CMS texts" ON public.cms_texts
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage CMS texts" ON public.cms_texts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies for media
CREATE POLICY "Anyone can view media" ON public.media
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage media" ON public.media
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies for reviews
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

-- RLS Policies for admin audit
CREATE POLICY "Admins can view audit logs" ON public.admin_audit
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can create audit logs" ON public.admin_audit
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies for storage
CREATE POLICY "Anyone can view public media" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-media');

CREATE POLICY "Admins can upload to public media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'public-media' AND
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can manage private docs" ON storage.objects
  FOR ALL USING (
    bucket_id = 'private-docs' AND
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Insert default CMS content
INSERT INTO public.cms_texts (key, value) VALUES
  ('homepage.hero.title', 'Discover Authentic Jharkhand'),
  ('homepage.hero.subtitle', 'Experience the rich culture, traditions, and natural beauty'),
  ('homepage.about.title', 'About Jatra'),
  ('homepage.about.description', 'Your gateway to authentic cultural experiences in Jharkhand'),
  ('experiences.title', 'Unique Experiences'),
  ('marketplace.title', 'Local Marketplace')
ON CONFLICT (key) DO NOTHING;