
-- ==============================================================================
-- TALIBON LGU ENTERPRISE CORE - FULL DATABASE SCHEMA (FIXED PERMISSIONS & SYNC)
-- ==============================================================================

-- 1. RESET SCHEMA
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 2. BASIC PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- 3. USER PROFILES
-- ==============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  job_level TEXT NOT NULL,
  role TEXT DEFAULT 'STAFF',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, department, job_level, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'department', 'Unassigned'),
    COALESCE(new.raw_user_meta_data->>'job_level', 'CLERK'),
    'STAFF'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 4. DOCUMENT MANAGEMENT
-- ==============================================================================
CREATE TABLE public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  originating_dept TEXT NOT NULL,
  current_holder_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL,
  priority TEXT DEFAULT 'Routine',
  attachments JSONB DEFAULT '[]', -- Changed to JSONB for rich metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.document_routing (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  from_dept TEXT,
  to_user_id UUID REFERENCES public.profiles(id),
  status TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON TABLE public.documents TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.document_routing TO anon, authenticated, service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_routing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for docs" ON public.documents FOR ALL USING (true);
CREATE POLICY "Enable all access for routing" ON public.document_routing FOR ALL USING (true);

-- ==============================================================================
-- 5. FINANCIAL VOUCHERS
-- ==============================================================================
CREATE TABLE public.vouchers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ref_number TEXT,
    payee TEXT NOT NULL,
    particulars TEXT,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    type TEXT,
    current_stage TEXT,
    status TEXT,
    prepared_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.voucher_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    voucher_id UUID REFERENCES public.vouchers(id) ON DELETE CASCADE,
    stage TEXT,
    action TEXT,
    notes TEXT,
    actor_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON TABLE public.vouchers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.voucher_history TO anon, authenticated, service_role;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for vouchers" ON public.vouchers FOR ALL USING (true);
CREATE POLICY "Enable all access for voucher history" ON public.voucher_history FOR ALL USING (true);

-- ==============================================================================
-- 6. MESSAGING
-- ==============================================================================
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id),
  recipient_id UUID REFERENCES public.profiles(id),
  content TEXT,
  message_type TEXT DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON TABLE public.messages TO anon, authenticated, service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for messages" ON public.messages FOR ALL USING (true);

-- ==============================================================================
-- 7. APPLICATIONS
-- ==============================================================================
CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_number TEXT UNIQUE,
    type TEXT,
    business_name TEXT,
    applicant_name TEXT,
    submission_date DATE DEFAULT CURRENT_DATE,
    status TEXT,
    current_department TEXT,
    assessed_amount NUMERIC(15, 2),
    payment_status TEXT DEFAULT 'Unpaid',
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.application_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    action TEXT,
    actor TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON TABLE public.applications TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.application_logs TO anon, authenticated, service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for applications" ON public.applications FOR ALL USING (true);
CREATE POLICY "Enable all access for app logs" ON public.application_logs FOR ALL USING (true);

-- ==============================================================================
-- 8. PROJECTS
-- ==============================================================================
CREATE TABLE public.projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    department TEXT,
    budget NUMERIC(15, 2),
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Planning',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON TABLE public.projects TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.projects_id_seq TO anon, authenticated, service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for projects" ON public.projects FOR ALL USING (true);

-- ==============================================================================
-- 9. CALENDAR EVENTS
-- ==============================================================================
CREATE TABLE public.calendar_events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    type TEXT,
    organizer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT ALL ON TABLE public.calendar_events TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.calendar_events_id_seq TO anon, authenticated, service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for calendar" ON public.calendar_events FOR ALL USING (true);

-- ==============================================================================
-- 10. STORAGE
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Documents" ON storage.objects;

CREATE POLICY "Public Access Documents" ON storage.objects FOR SELECT USING ( bucket_id = 'documents' );
CREATE POLICY "Authenticated Upload Documents" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

-- ==============================================================================
-- 11. DATA RECOVERY & SEEDING (CRITICAL FIX FOR FK ERRORS)
-- ==============================================================================

-- Sync existing Auth Users to Profiles (Fixes 'Key not present in table profiles' error)
INSERT INTO public.profiles (id, email, full_name, department, job_level, role)
SELECT 
    id, 
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'User ' || substr(email, 1, 4)),
    COALESCE(raw_user_meta_data->>'department', 'Unassigned'),
    COALESCE(raw_user_meta_data->>'job_level', 'CLERK'),
    'STAFF'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Seed Data
INSERT INTO public.projects (name, location, department, budget, progress, status)
VALUES 
('Road Widening Phase 1', 'Brgy. San Jose', 'Engineering', 2500000, 45, 'Ongoing'),
('Public Market Solar Panel Install', 'Poblacion', 'Engineering', 15000000, 100, 'Completed');

INSERT INTO public.calendar_events (title, start_time, location, type, organizer)
VALUES
('Q4 Budget Hearing', NOW() + INTERVAL '2 days', 'Session Hall', 'Internal', 'Treasury'),
('Annual Fiesta Planning', NOW() + INTERVAL '5 days', 'Mayor Conference Room', 'Public', 'Tourism');
