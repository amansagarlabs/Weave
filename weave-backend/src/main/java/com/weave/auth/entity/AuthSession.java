package com.weave.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_sessions")
public class AuthSession {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, unique = true, length = 128) private String tokenHash;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(nullable = false) private Instant expiresAt;
    private Instant revokedAt;
    @Column(length = 512) private String userAgent;
    @Column(length = 64) private String ipAddress;

    protected AuthSession() { }

    public static AuthSession create(User user, String tokenHash, Instant expiresAt, String userAgent, String ipAddress) {
        AuthSession session = new AuthSession();
        session.id = UUID.randomUUID();
        session.user = user;
        session.tokenHash = tokenHash;
        session.expiresAt = expiresAt;
        session.userAgent = userAgent;
        session.ipAddress = ipAddress;
        return session;
    }

    public User getUser() { return user; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isActive(Instant now) { return revokedAt == null && expiresAt.isAfter(now); }
    public void revoke() { revokedAt = Instant.now(); }
}
