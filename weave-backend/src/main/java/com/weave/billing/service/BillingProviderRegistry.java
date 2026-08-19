package com.weave.billing.service;

import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class BillingProviderRegistry {
    private final List<BillingProviderAdapter> adapters;

    public BillingProviderRegistry(List<BillingProviderAdapter> adapters) {
        this.adapters = adapters;
    }

    public BillingProviderAdapter resolve(String provider) {
        final String normalized = normalize(provider).isBlank() ? "UNIBEE" : normalize(provider);
        return adapters.stream()
                .filter(adapter -> normalize(adapter.provider()).equals(normalized))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Billing provider " + normalized + " is not configured"));
    }

    private String normalize(String provider) {
        return provider == null ? "" : provider.trim().toUpperCase(Locale.ROOT);
    }
}
