-- Fix the profiles table first by adding the role column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'tourist';

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update foreign key reference
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider_id uuid;

-- Now create the providers table
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  description text,
  verified boolean DEFAULT false,
  verification_proof text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add remaining tables
CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  short_description text,
  full_description text,
  category text,
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

CREATE TABLE IF NOT EXISTS public.experience_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES public.experiences(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  seats_total integer NOT NULL DEFAULT 0,
  seats_booked integer NOT NULL DEFAULT 0,
  price_override numeric(10,2),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_slots_experience ON public.experience_slots(experience_id);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL,
  slot_id uuid REFERENCES public.experience_slots(id) ON DELETE SET NULL,
  participants integer DEFAULT 1,
  total_amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'pending',
  payment_provider text,
  payment_reference text,
  eco_points_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);

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

CREATE TABLE IF NOT EXISTS public.eco_points_balance (
  user_id uuid REFERENCES public.profiles(id) PRIMARY KEY,
  total_points integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.eco_points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  tx_type text,
  points integer,
  reference text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ep_tx_user ON public.eco_points_transactions(user_id);

CREATE TABLE IF NOT EXISTS public.cms_texts (
  key text PRIMARY KEY,
  value text,
  last_updated timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text,
  path text,
  url text,
  uploaded_by uuid REFERENCES public.profiles(id),
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid REFERENCES public.experiences(id),
  user_id uuid REFERENCES public.profiles(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  sentiment text,
  created_at timestamptz DEFAULT now()
);

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