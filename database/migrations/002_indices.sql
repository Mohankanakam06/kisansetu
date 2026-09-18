-- 002_indices.sql
-- Performance indexes for the Kisan Setu marketplace.
-- Additive and idempotent: safe to run more than once.

-- Spatial indexes: listings are clustered by proximity and lots are matched
-- to buyers by nearest centroid, both of which do a GEOGRAPHY distance scan.
CREATE INDEX IF NOT EXISTS idx_listings_location
    ON listings USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_lots_centroid
    ON lots USING GIST (centroid);

-- Filter/join indexes for the hot marketplace paths.
CREATE INDEX IF NOT EXISTS idx_listings_farmer_id
    ON listings (farmer_id);

CREATE INDEX IF NOT EXISTS idx_listings_status_crop
    ON listings (status, crop_type);

CREATE INDEX IF NOT EXISTS idx_lots_status_crop
    ON lots (status, crop_type);

CREATE INDEX IF NOT EXISTS idx_lot_listings_listing_id
    ON lot_listings (listing_id);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id
    ON orders (buyer_id);

CREATE INDEX IF NOT EXISTS idx_orders_lot_id
    ON orders (lot_id);

CREATE INDEX IF NOT EXISTS idx_orders_status_created
    ON orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quality_grades_lot_id
    ON quality_grades (lot_id);

CREATE INDEX IF NOT EXISTS idx_routes_order_id
    ON routes (order_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id
    ON payments (order_id);

CREATE INDEX IF NOT EXISTS idx_payments_farmer_id
    ON payments (farmer_id);

CREATE INDEX IF NOT EXISTS idx_price_history_crop_region_date
    ON price_history (crop_type, region, date DESC);
