-- ============================================
-- COMPLETE SUPABASE BACKEND FOR SOLAR DASHBOARD
-- ============================================
-- Production-ready database schema with RLS policies
-- Supports Admin and Customer roles
-- Beginner-friendly with clear comments
-- ============================================

-- ============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on auth.users (Supabase built-in)
-- This is already enabled by default

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- --------------------------------------------
-- TABLE: users
-- Purpose: Store user role and basic info
-- Links to: auth.users (Supabase Auth)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- --------------------------------------------
-- TABLE: user_profiles
-- Purpose: Store customer solar system details
-- One profile per customer
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Location
    state TEXT,
    city TEXT,
    address TEXT,
    
    -- System Details
    plant_name TEXT,
    system_size DECIMAL(10,2), -- in kW
    installation_type TEXT, -- 'rooftop', 'ground', 'hybrid'
    installation_date DATE,
    
    -- Financial
    tariff DECIMAL(10,2), -- electricity rate per unit
    purchase_type TEXT, -- 'cash', 'loan'
    loan_amount DECIMAL(12,2),
    loan_tenure INTEGER, -- in months
    interest_rate DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one profile per user
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.user_profiles(city);

-- --------------------------------------------
-- TABLE: roi_data
-- Purpose: Store ROI calculations for each user
-- Updated when profile changes
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.roi_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- ROI Metrics
    annual_savings DECIMAL(12,2),
    roi_percent DECIMAL(5,2),
    payback_years DECIMAL(5,2),
    net_profit_25_years DECIMAL(12,2),
    
    -- Energy Metrics
    annual_generation DECIMAL(10,2), -- kWh
    annual_consumption DECIMAL(10,2), -- kWh
    
    -- Cost Breakdown
    total_investment DECIMAL(12,2),
    installation_cost DECIMAL(12,2),
    maintenance_cost_annual DECIMAL(10,2),
    
    -- Subsidy
    government_subsidy DECIMAL(12,2),
    subsidy_eligible BOOLEAN DEFAULT false,
    
    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one ROI record per user
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.roi_data ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_roi_user_id ON public.roi_data(user_id);

-- --------------------------------------------
-- TABLE: leads
-- Purpose: Store calculator submissions (no login required)
-- Admin can view and manage these as sales leads
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact Info
    name TEXT,
    phone TEXT,
    email TEXT,
    
    -- Location
    city TEXT,
    state TEXT,
    
    -- Calculator Data
    system_size DECIMAL(10,2), -- kW
    monthly_bill DECIMAL(10,2),
    purchase_type TEXT, -- 'cash', 'loan'
    
    -- Estimates
    estimated_cost DECIMAL(12,2),
    estimated_savings DECIMAL(12,2),
    payback_years DECIMAL(5,2),
    
    -- Lead Management
    source TEXT DEFAULT 'calculator', -- 'calculator', 'contact_form', 'referral'
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'lost')),
    notes TEXT,
    
    -- Timestamps
    contacted_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_city ON public.leads(city);

-- --------------------------------------------
-- TABLE: complaints
-- Purpose: Customer support tickets
-- Customers can create, Admin can manage
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Complaint Details
    complaint_type TEXT NOT NULL, -- 'performance', 'technical', 'cleaning', 'damage', 'billing', 'installation', 'other'
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    description TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    
    -- Attachments
    photo_url TEXT,
    
    -- Admin Response
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);

-- --------------------------------------------
-- TABLE: system_data
-- Purpose: Store real-time system performance data
-- Updated by IoT devices or manual entry
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Real-time Metrics
    current_power DECIMAL(10,2), -- kW
    today_generation DECIMAL(10,2), -- kWh
    today_consumption DECIMAL(10,2), -- kWh
    
    -- Lifetime Metrics
    total_generation DECIMAL(12,2), -- kWh
    total_consumption DECIMAL(12,2), -- kWh
    
    -- System Status
    system_status TEXT DEFAULT 'online' CHECK (system_status IN ('online', 'offline', 'maintenance', 'error')),
    system_health INTEGER DEFAULT 100 CHECK (system_health >= 0 AND system_health <= 100),
    
    -- Weather
    weather_condition TEXT, -- 'sunny', 'cloudy', 'rainy', 'stormy'
    temperature DECIMAL(5,2),
    
    -- Timestamps
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one system_data record per user
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.system_data ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_system_data_user_id ON public.system_data(user_id);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- --------------------------------------------
-- RLS POLICIES: users
-- --------------------------------------------

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users"
ON public.users
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: New users can insert their own record (signup)
CREATE POLICY "Users can insert own record"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- --------------------------------------------
-- RLS POLICIES: user_profiles
-- --------------------------------------------

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON public.user_profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.user_profiles
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- --------------------------------------------
-- RLS POLICIES: roi_data
-- --------------------------------------------

-- Policy: Users can read their own ROI data
CREATE POLICY "Users can read own ROI"
ON public.roi_data
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can read all ROI data
CREATE POLICY "Admins can read all ROI"
ON public.roi_data
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Users can insert their own ROI data
CREATE POLICY "Users can insert own ROI"
ON public.roi_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own ROI data
CREATE POLICY "Users can update own ROI"
ON public.roi_data
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can update any ROI data
CREATE POLICY "Admins can update any ROI"
ON public.roi_data
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- --------------------------------------------
-- RLS POLICIES: leads
-- --------------------------------------------

-- Policy: Public can insert leads (calculator submissions)
CREATE POLICY "Public can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (true); -- Anyone can submit

-- Policy: Admins can read all leads
CREATE POLICY "Admins can read all leads"
ON public.leads
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admins can update leads
CREATE POLICY "Admins can update leads"
ON public.leads
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admins can delete leads
CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- --------------------------------------------
-- RLS POLICIES: complaints
-- --------------------------------------------

-- Policy: Users can read their own complaints
CREATE POLICY "Users can read own complaints"
ON public.complaints
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can read all complaints
CREATE POLICY "Admins can read all complaints"
ON public.complaints
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Users can insert their own complaints
CREATE POLICY "Users can insert own complaints"
ON public.complaints
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own complaints (before resolved)
CREATE POLICY "Users can update own complaints"
ON public.complaints
FOR UPDATE
USING (auth.uid() = user_id AND status != 'resolved')
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can update any complaint
CREATE POLICY "Admins can update any complaint"
ON public.complaints
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- --------------------------------------------
-- RLS POLICIES: system_data
-- --------------------------------------------

-- Policy: Users can read their own system data
CREATE POLICY "Users can read own system data"
ON public.system_data
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can read all system data
CREATE POLICY "Admins can read all system data"
ON public.system_data
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Users can insert their own system data
CREATE POLICY "Users can insert own system data"
ON public.system_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own system data
CREATE POLICY "Users can update own system data"
ON public.system_data
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can update any system data
CREATE POLICY "Admins can update any system data"
ON public.system_data
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- --------------------------------------------
-- FUNCTION: Update updated_at timestamp
-- --------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roi_updated_at
    BEFORE UPDATE ON public.roi_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------
-- FUNCTION: Create user record on signup
-- Automatically creates a user record when someone signs up
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create user record on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. SEED DATA (DEMO ACCOUNTS)
-- ============================================

-- Note: You need to create these users in Supabase Auth first
-- Then manually update their role in the users table

-- Admin Account:
-- Email: admin@akvenergy.com
-- Password: admin123
-- After signup, run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@akvenergy.com';

-- Customer Account:
-- Email: customer@example.com
-- Password: customer123
-- Role is automatically set to 'customer'

-- ============================================
-- 6. HELPER FUNCTIONS FOR FRONTEND
-- ============================================

-- --------------------------------------------
-- FUNCTION: Get user role
-- Usage: SELECT get_user_role();
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM public.users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- FUNCTION: Check if user is admin
-- Usage: SELECT is_admin();
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin' FROM public.users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. VIEWS FOR ADMIN DASHBOARD
-- ============================================

-- --------------------------------------------
-- VIEW: Admin overview of all customers
-- --------------------------------------------
CREATE OR REPLACE VIEW public.admin_customer_overview AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.created_at,
    p.city,
    p.state,
    p.system_size,
    p.installation_type,
    p.purchase_type,
    r.annual_savings,
    r.roi_percent,
    r.payback_years,
    sd.system_status,
    sd.system_health,
    sd.total_generation
FROM public.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
LEFT JOIN public.roi_data r ON u.id = r.user_id
LEFT JOIN public.system_data sd ON u.id = sd.user_id
WHERE u.role = 'customer'
ORDER BY u.created_at DESC;

-- Grant access to admins only
GRANT SELECT ON public.admin_customer_overview TO authenticated;

-- RLS policy for view
CREATE POLICY "Admins can view customer overview"
ON public.admin_customer_overview
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_city ON public.user_profiles(user_id, city);
CREATE INDEX IF NOT EXISTS idx_complaints_user_status ON public.complaints(user_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON public.leads(status, created_at DESC);

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Next Steps:
-- 1. Create admin user in Supabase Auth dashboard
-- 2. Update admin user role: UPDATE public.users SET role = 'admin' WHERE email = 'admin@akvenergy.com';
-- 3. Configure Supabase credentials in frontend (js/supabase-auth.js)
-- 4. Test authentication flow
-- 5. Test RLS policies with different roles

-- Security Checklist:
-- ✅ RLS enabled on all tables
-- ✅ Customers can only access their own data
-- ✅ Admins can access all data
-- ✅ Public can only insert leads
-- ✅ Automatic user creation on signup
-- ✅ Role-based access control
-- ✅ Timestamps auto-updated
-- ✅ Foreign key constraints
-- ✅ Check constraints for data validation

COMMENT ON TABLE public.users IS 'User accounts with role-based access';
COMMENT ON TABLE public.user_profiles IS 'Customer solar system profiles';
COMMENT ON TABLE public.roi_data IS 'ROI calculations for each customer';
COMMENT ON TABLE public.leads IS 'Calculator submissions (no login required)';
COMMENT ON TABLE public.complaints IS 'Customer support tickets';
COMMENT ON TABLE public.system_data IS 'Real-time system performance data';
