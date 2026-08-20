CREATE TABLE auth_audit_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(80) NOT NULL,
    outcome VARCHAR(16) NOT NULL,
    subject_hash CHAR(64),
    ip_hash CHAR(64),
    user_agent_hash CHAR(64),
    details VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_auth_audit_outcome CHECK (outcome IN ('SUCCESS', 'FAILURE', 'CHALLENGE'))
);

CREATE INDEX idx_auth_audit_created_at ON auth_audit_events (created_at DESC);
CREATE INDEX idx_auth_audit_user_created ON auth_audit_events (user_id, created_at DESC);
CREATE INDEX idx_auth_audit_event_created ON auth_audit_events (event_type, created_at DESC);
