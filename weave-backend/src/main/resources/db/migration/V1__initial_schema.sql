CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL CHECK (role IN ('CREATOR', 'BRAND', 'EDITOR', 'ADMIN')),
    locale VARCHAR(16) NOT NULL DEFAULT 'en-IN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE creator_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id), display_name VARCHAR(160) NOT NULL, public_slug VARCHAR(180) NOT NULL UNIQUE,
    categories_json JSONB, platforms_json JSONB, city VARCHAR(120), content_language VARCHAR(80),
    availability_status VARCHAR(40), influencing_score INTEGER
);
CREATE TABLE brand_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id), company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(120), gstin VARCHAR(32)
);
CREATE TABLE editor_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id), portfolio_links_json JSONB, rating NUMERIC(3,2)
);
CREATE TABLE packages (
    id BIGSERIAL PRIMARY KEY, owner_id BIGINT NOT NULL REFERENCES users(id), owner_type VARCHAR(20) NOT NULL,
    content_type VARCHAR(120) NOT NULL, price NUMERIC(12,2) NOT NULL, delivery_days INTEGER, revisions_included INTEGER
);
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY, brand_id BIGINT NOT NULL REFERENCES users(id), creator_id BIGINT NOT NULL REFERENCES users(id),
    package_id BIGINT REFERENCES packages(id), status VARCHAR(32) NOT NULL, amount NUMERIC(12,2),
    status_history_json JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE edit_requests (
    id BIGSERIAL PRIMARY KEY, creator_id BIGINT NOT NULL REFERENCES users(id), editor_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(32), revision_count INTEGER NOT NULL DEFAULT 0, payment_status VARCHAR(32),
    preview_asset_url TEXT, final_asset_url TEXT, suspension_flag BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY, thread_id VARCHAR(120) NOT NULL, sender_id BIGINT NOT NULL REFERENCES users(id),
    recipient_id BIGINT NOT NULL REFERENCES users(id), body VARCHAR(5000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
