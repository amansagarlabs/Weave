package com.weave.billing.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.billing.dto.BillingAccountResponse;
import com.weave.billing.dto.BillingPlanRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BillingService {
    private final UserRepository users;
    private final BillingProviderRegistry providers;
    private final String billingPortalUrl;

    public BillingService(UserRepository users, BillingProviderRegistry providers, @Value("${weave.billing.portal-url:http://localhost:3000/billing}") String billingPortalUrl) {
        this.users = users;
        this.providers = providers;
        this.billingPortalUrl = billingPortalUrl;
    }

    public BillingAccountResponse me(String email) {
        return from(user(email));
    }

    public BillingAccountResponse updatePlan(String email, BillingPlanRequest request) {
        User user = user(email);
        String plan = request.plan().trim().toUpperCase();
        if ("FREE".equals(plan)) {
            user.activateFreeBillingPlan();
            return from(users.save(user), "Free plan active. No payment method or gateway call is required.");
        }

        String provider = normalizeProvider(request.provider());
        BillingProviderAdapter adapter = providers.resolve(provider);
        BillingProvisioningResult provisioning = adapter.provision(user, plan, billingPortalUrl);
        user.activatePaidBillingPlan(plan, provisioning.provider(), provisioning.customerId(), provisioning.subscriptionId(), provisioning.portalUrl(), provisioning.status());
        return from(users.save(user), provisioning.message());
    }

    public BillingAccountResponse portal(String email) {
        User user = user(email);
        String portal = "FREE".equalsIgnoreCase(user.getBillingPlan())
                ? billingPortalUrl
                : providers.resolve(user.getBillingProvider()).portalUrl(user, billingPortalUrl);
        if (portal == null || portal.isBlank()) portal = billingPortalUrl;
        return new BillingAccountResponse(user.getBillingPlan(), user.getBillingProvider(), user.getBillingStatus(), portal, "FREE".equalsIgnoreCase(user.getBillingPlan()), "Open the provider-neutral billing portal to manage the current plan.");
    }

    private BillingAccountResponse from(User user) {
        return from(user, "Open the provider-neutral billing portal to manage the current plan.");
    }

    private BillingAccountResponse from(User user, String message) {
        return new BillingAccountResponse(user.getBillingPlan(), user.getBillingProvider(), user.getBillingStatus(), user.getBillingPortalUrl() == null || user.getBillingPortalUrl().isBlank() ? billingPortalUrl : user.getBillingPortalUrl(), "FREE".equalsIgnoreCase(user.getBillingPlan()), message);
    }

    private User user(String email) {
        return users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String normalizeProvider(String provider) {
        return provider == null ? "" : provider.trim().toUpperCase();
    }
}
