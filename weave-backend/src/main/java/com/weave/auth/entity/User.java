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
    public Role getRole() { return role; }
    public String getPhone() { return phone; }
    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }
    public String getNotificationPreference() { return notificationPreference; }
    public void setNotificationPreference(String notificationPreference) { this.notificationPreference = notificationPreference; }
    public boolean isSuspended() { return suspended; }
    public boolean isEmailVerified() { return emailVerified; }
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
