package com.weave.billing.dto;

import jakarta.validation.constraints.NotBlank;

public record BillingPlanRequest(
        @NotBlank String plan,
        String provider) {
}
