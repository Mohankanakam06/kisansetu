CREATE EXTENSION IF NOT EXISTS postgis;

-- Example tables mentioned in your roadmap:
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'farmer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id),
    crop_type VARCHAR(100) NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL,
    price_expectation NUMERIC(10, 2) NOT NULL,
    location GEOGRAPHY(Point, 4326),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_type VARCHAR(100) NOT NULL,
    total_quantity_kg NUMERIC(10, 2) NOT NULL,
    grade VARCHAR(5),
    status VARCHAR(50) DEFAULT 'forming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lot_listings (
    lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    PRIMARY KEY (lot_id, listing_id)
);

CREATE TABLE IF NOT EXISTS quality_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
    grade VARCHAR(5) NOT NULL,
    defects JSONB DEFAULT '[]'::jsonb,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id),
    lot_id UUID REFERENCES lots(id),
    quantity_kg NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);