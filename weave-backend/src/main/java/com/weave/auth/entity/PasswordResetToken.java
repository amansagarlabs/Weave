package com.weave.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;
    @Column(nullable = false)
    private Instant expiresAt;
    private Instant usedAt;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    @Column(length = 64)
    private String requestIp;

    protected PasswordResetToken() { }

    public static PasswordResetToken create(User user, String tokenHash, Instant expiresAt, String requestIp) {
        PasswordResetToken token = new PasswordResetToken();
        token.id = UUID.randomUUID();
        token.user = user;
        token.tokenHash = tokenHash;
        token.expiresAt = expiresAt;
        token.requestIp = requestIp;
        return token;
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public boolean isActive(Instant now) { return usedAt == null && expiresAt.isAfter(now); }
    public void consume() { usedAt = Instant.now(); }
}
