CREATE TABLE storage_uploads (
    id BIGSERIAL PRIMARY KEY,
    legacy_url TEXT,
    public_id VARCHAR(255),
    resource_type VARCHAR(80),
    format VARCHAR(80),
    version BIGINT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    committed_at TIMESTAMPTZ
);

CREATE INDEX idx_storage_uploads_pending_created
    ON storage_uploads (status, created_at);
