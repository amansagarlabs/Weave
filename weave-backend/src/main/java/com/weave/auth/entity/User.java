package com.weave.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String email;
    @Column(unique = true) private String phone;
    @Column(nullable = false) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    @Column(nullable = false) private String locale = "en-IN";
    @Column(nullable = false) private String notificationPreference = "EMAIL";
    @Column(nullable = false) private boolean suspended = false;
    @Column(nullable = false) private boolean emailVerified = true;
    @Column(nullable = false) private boolean mfaEnabled = false;
    @Column(length = 128) private String mfaSecret;
    @Column(columnDefinition = "text") private String mfaRecoveryCodeHashes;
    @Column(nullable = false) private String billingPlan = "FREE";
    @Column(nullable = false) private String billingProvider = "NONE";
    @Column private String billingCustomerId;
    @Column private String billingSubscriptionId;
    @Column(columnDefinition = "text") private String billingPortalUrl;
    @Column(nullable = false) private String billingStatus = "ACTIVE";
    private Long activeOrganizationId;
    @Column(length = 128) private String emailVerificationTokenHash;
    private Instant emailVerificationExpiresAt;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();

    protected User() { }

    public static User create(String email, String phone, String passwordHash, Role role) {
        User user = new User();
        user.email = email;
        user.phone = phone;
        user.passwordHash = passwordHash;
        user.role = role;
        user.emailVerified = false;
        return user;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public void changePassword(String passwordHash) { this.passwordHash = passwordHash; }
    public Role getRole() { return role; }
    public String getPhone() { return phone; }
    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }
    public String getNotificationPreference() { return notificationPreference; }
    public void setNotificationPreference(String notificationPreference) { this.notificationPreference = notificationPreference; }
    public boolean isSuspended() { return suspended; }
    public boolean isEmailVerified() { return emailVerified; }
    public boolean isMfaEnabled() { return mfaEnabled; }
    public String getMfaSecret() { return mfaSecret; }
    public String getMfaRecoveryCodeHashes() { return mfaRecoveryCodeHashes; }
    public void setMfaSecret(String mfaSecret) { this.mfaSecret = mfaSecret; }
    public void setMfaRecoveryCodeHashes(String mfaRecoveryCodeHashes) { this.mfaRecoveryCodeHashes = mfaRecoveryCodeHashes; }
    public void configureMfa(String secret, String recoveryCodeHashes) { this.mfaSecret = secret; this.mfaRecoveryCodeHashes = recoveryCodeHashes; this.mfaEnabled = false; }
    public void enableMfa() { this.mfaEnabled = true; }
    public void disableMfa() { this.mfaEnabled = false; this.mfaSecret = null; this.mfaRecoveryCodeHashes = null; }
    public String getBillingPlan() { return billingPlan; }
    public String getBillingProvider() { return billingProvider; }
    public String getBillingCustomerId() { return billingCustomerId; }
    public String getBillingSubscriptionId() { return billingSubscriptionId; }
    public String getBillingPortalUrl() { return billingPortalUrl; }
    public String getBillingStatus() { return billingStatus; }
    public Long getActiveOrganizationId() { return activeOrganizationId; }
    public void setActiveOrganizationId(Long activeOrganizationId) { this.activeOrganizationId = activeOrganizationId; }
    public void activateFreeBillingPlan() {
        this.billingPlan = "FREE";
        this.billingProvider = "NONE";
        this.billingCustomerId = null;
        this.billingSubscriptionId = null;
        this.billingPortalUrl = null;
        this.billingStatus = "ACTIVE";
    }
    public void activatePaidBillingPlan(String plan, String provider, String customerId, String subscriptionId, String portalUrl, String status) {
        this.billingPlan = plan;
        this.billingProvider = provider;
        this.billingCustomerId = customerId;
        this.billingSubscriptionId = subscriptionId;
        this.billingPortalUrl = portalUrl;
        this.billingStatus = status;
    }
    public void markEmailVerified() { this.emailVerified = true; this.emailVerificationTokenHash = null; this.emailVerificationExpiresAt = null; }
    public void beginEmailVerification(String tokenHash, Instant expiresAt) {
        this.emailVerified = false;
        this.emailVerificationTokenHash = tokenHash;
        this.emailVerificationExpiresAt = expiresAt;
    }
    public boolean verifyEmail(Instant now, String tokenHash) {
        if (emailVerified || emailVerificationTokenHash == null || emailVerificationExpiresAt == null
                || emailVerificationExpiresAt.isBefore(now) || !emailVerificationTokenHash.equals(tokenHash)) return false;
        markEmailVerified();
        return true;
    }
    public void suspend() { this.suspended = true; }
    public void restore() { this.suspended = false; }
}
