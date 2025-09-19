-- Drop existing tables to recreate with comprehensive schema
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.eco_points_config CASCADE;
DROP TABLE IF EXISTS public.experience_slots CASCADE;
DROP TABLE IF EXISTS public.experiences CASCADE;
DROP TABLE IF EXISTS public.marketplace_items CASCADE;
DROP TABLE IF EXISTS public.site_content CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS experience_category CASCADE;
DROP TYPE IF EXISTS marketplace_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 1. Profiles (connected to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'tourist', -- 'tourist','provider','admin'
  provider_id uuid, -- FK to providers if role='provider'
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Providers (local guides, homestays, artisans)
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  description text,
  verified boolean DEFAULT false,
  verification_proof text, -- IPFS hash / doc URL
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Experiences (trips, workshops, education trips)
CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  short_description text,
  full_description text,
  category text, -- Agriculture/Art & Craft/Village Life/Food/EduTrip
  provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'INR',
  featured boolean DEFAULT false,
  published boolean DEFAULT false,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_category ON public.experiences(category);

-- 4. Experience Slots (date/time availability)
CREATE TABLE IF NOT EXISTS public.experience_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES public.experiences(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  seats_total integer NOT NULL DEFAULT 0,
  seats_booked integer NOT NULL DEFAULT 0,
  price_override numeric(10,2), -- nullable to override base price
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_slots_experience ON public.experience_slots(experience_id);

-- 5. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL,
  slot_id uuid REFERENCES public.experience_slots(id) ON DELETE SET NULL,
  participants integer DEFAULT 1,
  total_amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'pending', -- pending/confirmed/cancelled/refunded
  payment_provider text,
  payment_reference text,
  eco_points_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);

-- 6. Marketplace products (handicrafts)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category text,
  price numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  stock integer DEFAULT 0,
  sku text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_provider ON public.products(provider_id);

-- 7. Eco Points
CREATE TABLE IF NOT EXISTS public.eco_points_balance (
  user_id uuid REFERENCES public.profiles(id) PRIMARY KEY,
  total_points integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.eco_points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  tx_type text, -- earn/redeem/adjust
  points integer,
  reference text, -- e.g. booking id or product id
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ep_tx_user ON public.eco_points_transactions(user_id);

-- 8. CMS Texts (for editable site copy)
CREATE TABLE IF NOT EXISTS public.cms_texts (
  key text PRIMARY KEY, -- e.g. 'homepage.hero.title'
  value text,
  last_updated timestamptz DEFAULT now()
);

-- 9. Media (store file metadata)
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text,
  path text,
  url text,
  uploaded_by uuid REFERENCES public.profiles(id),
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- 10. Reviews & feedback
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES public.experiences(id),
  user_id uuid REFERENCES public.profiles(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  sentiment text, -- derived by AI (positive/neutral/negative)
  created_at timestamptz DEFAULT now()
);

-- 11. Admin actions log (audit)
CREATE TABLE IF NOT EXISTS public.admin_audit (
  id bigserial PRIMARY KEY,
  admin_id uuid REFERENCES public.profiles(id),
  action text,
  object_type text,
  object_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('public-media', 'public-media', true),
  ('private-docs', 'private-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
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

-- Function to create booking with eco points (atomic transaction)
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

-- Function to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experience_slots_updated_at BEFORE UPDATE ON public.experience_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();