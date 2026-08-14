package com.weave.invoice.entity;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class InvoiceTest {
    @Test
    void transitionsSentInvoiceToOverdueAndPaid() {
        Instant due = Instant.parse("2026-01-01T00:00:00Z");
        Invoice invoice = Invoice.draft(1L, 2L, 3L, new BigDecimal("100.00"), due, null, null, null, null, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("100.00"));
        invoice.markSent("https://pay.example");
        assertTrue(invoice.markOverdue(Instant.parse("2026-01-02T00:00:00Z")));
        assertEquals("OVERDUE", invoice.getStatus());
        invoice.markPaid(Instant.parse("2026-01-03T00:00:00Z"));
        assertEquals("PAID", invoice.getStatus());
        assertFalse(invoice.markOverdue(Instant.parse("2026-01-04T00:00:00Z")));
    }
}
