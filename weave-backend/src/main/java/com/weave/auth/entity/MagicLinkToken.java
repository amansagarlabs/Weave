package com.weave.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_magic_links")
public class MagicLinkToken {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, unique = true, length = 128)
    private String tokenHash;
    @Column(nullable = false)
    private Instant expiresAt;
    private Instant consumedAt;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected MagicLinkToken() { }

    public static MagicLinkToken issue(User user, String tokenHash, Instant expiresAt) {
        MagicLinkToken token = new MagicLinkToken();
        token.id = UUID.randomUUID();
        token.user = user;
        token.tokenHash = tokenHash;
        token.expiresAt = expiresAt;
        return token;
    }

    public User getUser() { return user; }
    public String getTokenHash() { return tokenHash; }
    public boolean isUsable(Instant now) { return consumedAt == null && expiresAt.isAfter(now); }
    public void consume(Instant now) { consumedAt = now; }
}
