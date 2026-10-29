CREATE TABLE outbox_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(120) NOT NULL,
    aggregate_id VARCHAR(120) NOT NULL,
    payload TEXT NOT NULL,
    idempotency_key VARCHAR(180) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_error VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);
CREATE INDEX idx_outbox_due ON outbox_events(status, next_attempt_at);
