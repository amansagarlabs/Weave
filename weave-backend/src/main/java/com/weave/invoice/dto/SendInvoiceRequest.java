package com.weave.invoice.dto;

import jakarta.validation.constraints.AssertTrue;

public record SendInvoiceRequest(@AssertTrue(message = "Agreement confirmation is required before sending an invoice") Boolean agreementAccepted) { }
