CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    request_ip VARCHAR(64)
);

CREATE INDEX idx_password_reset_tokens_user_expiry
    ON password_reset_tokens(user_id, expires_at);
