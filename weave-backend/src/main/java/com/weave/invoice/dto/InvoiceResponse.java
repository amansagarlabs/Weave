package com.weave.invoice.dto;

import com.weave.invoice.entity.Invoice;
import java.math.BigDecimal;
import java.time.Instant;

public record InvoiceResponse(Long id, Long bookingId, Long creatorId, Long brandId, BigDecimal amount, String status, String paymentLink, Instant createdAt, Instant dueAt, Instant paidAt, String creatorGstin, String brandGstin, String sacCode, String placeOfSupply, BigDecimal gstRate, BigDecimal gstAmount, BigDecimal tdsRate, BigDecimal tdsAmount, BigDecimal netPayable) {
    public static InvoiceResponse from(Invoice invoice) { return new InvoiceResponse(invoice.getId(), invoice.getBookingId(), invoice.getCreatorId(), invoice.getBrandId(), invoice.getAmount(), invoice.getStatus(), invoice.getPaymentLink(), invoice.getCreatedAt(), invoice.getDueAt(), invoice.getPaidAt(), invoice.getCreatorGstin(), invoice.getBrandGstin(), invoice.getSacCode(), invoice.getPlaceOfSupply(), invoice.getGstRate(), invoice.getGstAmount(), invoice.getTdsRate(), invoice.getTdsAmount(), invoice.getNetPayable()); }
}
