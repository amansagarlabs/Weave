-- Public slug already has a unique index from V2; these indexes cover the main discovery and workspace queries.
CREATE INDEX IF NOT EXISTS idx_creator_profiles_categories_gin
    ON creator_profiles USING GIN (categories_json);

CREATE INDEX IF NOT EXISTS idx_bookings_brand_creator
    ON bookings (brand_id, creator_id);
CREATE INDEX IF NOT EXISTS idx_bookings_creator_brand
    ON bookings (creator_id, brand_id);

CREATE INDEX IF NOT EXISTS idx_messages_thread_created_at
    ON messages (thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created_at
    ON messages (sender_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_created_at
    ON messages (recipient_id, created_at);
