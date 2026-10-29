package com.weave.billing.service;

import com.weave.auth.entity.User;

public interface BillingProviderAdapter {
    String provider();
    BillingProvisioningResult provision(User user, String plan, String fallbackPortalUrl);
    String portalUrl(User user, String fallbackPortalUrl);
}
