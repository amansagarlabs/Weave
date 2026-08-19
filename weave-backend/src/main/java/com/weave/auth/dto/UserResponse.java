package com.weave.auth.dto;

import com.weave.auth.entity.User;

public record UserResponse(Long id, String email, String phone, String role, String locale, String notificationPreference, boolean suspended, boolean emailVerified, boolean mfaEnabled, String billingPlan, String billingProvider, String billingStatus, Long activeOrganizationId) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getPhone(), user.getRole().name(), user.getLocale(), user.getNotificationPreference(), user.isSuspended(), user.isEmailVerified(), user.isMfaEnabled(), user.getBillingPlan(), user.getBillingProvider(), user.getBillingStatus(), user.getActiveOrganizationId());
    }
}
