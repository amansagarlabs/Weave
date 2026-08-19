DROP INDEX IF EXISTS idx_invoices_booking_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_booking_id_unique
    ON invoices(booking_id);
