package com.weave.invoice.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record CreateInvoiceRequest(@NotNull Long bookingId, Instant dueAt, String creatorGstin, String brandGstin, String sacCode, String placeOfSupply, Boolean gstRegistered, Boolean tdsApplicable) { }
