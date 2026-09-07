CREATE EXTENSION IF NOT EXISTS postgis;
-- Try to create vector extension if pgvector is available
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'vector extension not available, skipping';
END
$$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer')),
  language_pref TEXT DEFAULT 'hi',
  location GEOGRAPHY(POINT),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES users(id),
  crop_type TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  price_expectation NUMERIC,
  location GEOGRAPHY(POINT) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'clustered', 'sold')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type TEXT NOT NULL,
  total_quantity_kg NUMERIC NOT NULL,
  grade TEXT,
  centroid GEOGRAPHY(POINT),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'ordered', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lot_listings (
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  PRIMARY KEY (lot_id, listing_id)
);

CREATE TABLE IF NOT EXISTS quality_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  defects JSONB,
  photo_url TEXT,
  graded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES lots(id),
  buyer_id UUID REFERENCES users(id),
  quantity_kg NUMERIC NOT NULL,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'routed', 'picked_up', 'delivered', 'settled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  route_geojson JSONB,
  distance_km NUMERIC,
  eta TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  farmer_id UUID REFERENCES users(id),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial_paid', 'settled')),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type TEXT NOT NULL,
  region TEXT NOT NULL,
  date DATE NOT NULL,
  avg_price NUMERIC NOT NULL
);
