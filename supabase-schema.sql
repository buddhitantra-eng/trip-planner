-- =====================================================
-- Trip Planner MVP – Supabase Schema
-- הרץ את זה ב: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Trips
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(9), 'base64'),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','generating','ready','error')),
  destination TEXT NOT NULL,
  destination_lat FLOAT8,
  destination_lng FLOAT8,
  budget_ils INTEGER,
  date_start DATE,
  date_end DATE,
  flexible_dates BOOLEAN DEFAULT false,
  travelers_count INTEGER DEFAULT 2,
  travelers_type TEXT DEFAULT 'couple',
  age_range_min INTEGER DEFAULT 25,
  age_range_max INTEGER DEFAULT 35,
  interests TEXT[] DEFAULT '{}',
  origin_city TEXT DEFAULT 'תל אביב',
  origin_iata TEXT DEFAULT 'TLV',
  itinerary JSONB,
  flights JSONB,
  cost_breakdown JSONB,
  generation_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Saved Trips (junction table)
CREATE TABLE IF NOT EXISTS saved_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, trip_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);
CREATE INDEX IF NOT EXISTS trips_share_token_idx ON trips(share_token);
CREATE INDEX IF NOT EXISTS saved_trips_user_id_idx ON saved_trips(user_id, saved_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_trips ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

-- Trips policies
CREATE POLICY "trips_select_own_or_shared" ON trips
  FOR SELECT USING (user_id = auth.uid() OR share_token IS NOT NULL);

CREATE POLICY "trips_insert" ON trips
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "trips_update_own" ON trips
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "trips_delete_own" ON trips
  FOR DELETE USING (user_id = auth.uid());

-- Saved trips policies
CREATE POLICY "saved_trips_all_own" ON saved_trips
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
