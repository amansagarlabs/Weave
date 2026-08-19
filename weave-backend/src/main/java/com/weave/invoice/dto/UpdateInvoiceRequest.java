package com.weave.invoice.dto;

import java.time.Instant;

public record UpdateInvoiceRequest(
        Instant dueAt,
        String creatorGstin,
        String brandGstin,
        String sacCode,
        String placeOfSupply,
        Boolean gstRegistered,
        Boolean tdsApplicable) { }
