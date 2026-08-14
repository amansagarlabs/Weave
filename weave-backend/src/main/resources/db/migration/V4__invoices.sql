CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id),
    creator_id BIGINT NOT NULL REFERENCES users(id),
    brand_id BIGINT NOT NULL REFERENCES users(id),
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    payment_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
);
CREATE INDEX idx_invoices_creator_id ON invoices(creator_id);
CREATE INDEX idx_invoices_brand_id ON invoices(brand_id);
CREATE INDEX idx_invoices_booking_id ON invoices(booking_id);
