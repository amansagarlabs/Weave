CREATE TABLE portfolio_assets (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(180) NOT NULL,
    asset_url TEXT NOT NULL,
    content_type VARCHAR(120) NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolio_assets_creator_created
    ON portfolio_assets (creator_id, created_at DESC);
