CREATE TABLE payment_webhook_receipts (
    id UUID PRIMARY KEY,
    provider_event_id VARCHAR(180) NOT NULL UNIQUE,
    event_type VARCHAR(120) NOT NULL,
    invoice_id BIGINT,
    payload_hash VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error VARCHAR(2000),
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_webhook_receipts_status
    ON payment_webhook_receipts(status, received_at);
