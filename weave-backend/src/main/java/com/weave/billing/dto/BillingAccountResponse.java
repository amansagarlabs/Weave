package com.weave.billing.dto;

public record BillingAccountResponse(
        String plan,
        String provider,
        String status,
        String portalUrl,
        boolean freePlan,
        String message) {
}
