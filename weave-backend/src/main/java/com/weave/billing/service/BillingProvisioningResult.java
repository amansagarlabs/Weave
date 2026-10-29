package com.weave.billing.service;

public record BillingProvisioningResult(
        String provider,
        String customerId,
        String subscriptionId,
        String portalUrl,
        String status,
        String message) {
}
