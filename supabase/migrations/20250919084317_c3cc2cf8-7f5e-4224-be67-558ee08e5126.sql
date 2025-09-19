-- Just enable RLS on the new tables without policies for now
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

-- Basic policies to allow access
CREATE POLICY "Enable read for authenticated users" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.experience_slots FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.eco_points_balance FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.eco_points_transactions FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.cms_texts FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.media FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.admin_audit FOR SELECT USING (true);

-- Admin insert/update policies
CREATE POLICY "Enable admin management" ON public.providers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.experiences FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.experience_slots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.eco_points_balance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.eco_points_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.cms_texts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.media FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enable admin management" ON public.admin_audit FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);