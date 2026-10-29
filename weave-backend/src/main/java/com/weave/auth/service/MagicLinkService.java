package com.weave.auth.service;

import com.weave.auth.dto.MagicLinkRequest;
import com.weave.auth.dto.VerificationResponse;
import com.weave.auth.entity.MagicLinkToken;
import com.weave.auth.entity.User;
import com.weave.auth.repository.MagicLinkTokenRepository;
import com.weave.auth.repository.UserRepository;
import com.weave.notification.service.EmailNotificationService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MagicLinkService {
    private final UserRepository users;
    private final MagicLinkTokenRepository tokens;
    private final EmailNotificationService email;
    private final String publicUrl;
    private final Duration lifetime;
    private final SecureRandom random = new SecureRandom();

    public MagicLinkService(UserRepository users, MagicLinkTokenRepository tokens, EmailNotificationService email,
                            @Value("${weave.app.public-url:http://localhost:3000}") String publicUrl,
                            @Value("${weave.auth.magic-link-lifetime:PT15M}") Duration lifetime) {
        this.users = users;
        this.tokens = tokens;
        this.email = email;
        this.publicUrl = publicUrl.replaceAll("/$", "");
        this.lifetime = lifetime;
    }

    @Transactional
    public VerificationResponse request(MagicLinkRequest request) {
        users.findByEmail(request.email().trim().toLowerCase()).ifPresent(user -> issue(user));
        return new VerificationResponse(true, "If the account exists, a sign-in link has been sent");
    }

    @Transactional
    public User consume(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) throw invalidToken();
        MagicLinkToken token = tokens.findByTokenHash(hash(rawToken)).orElseThrow(this::invalidToken);
        if (!token.isUsable(Instant.now())) throw invalidToken();
        token.consume(Instant.now());
        User user = token.getUser();
        if (user.isSuspended()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is suspended");
        if (!user.isEmailVerified()) user.markEmailVerified();
        tokens.save(token);
        users.save(user);
        return user;
    }

    private void issue(User user) {
        tokens.deleteByUserId(user.getId());
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String raw = HexFormat.of().formatHex(bytes);
        tokens.save(MagicLinkToken.issue(user, hash(raw), Instant.now().plus(lifetime)));
        email.sendMagicLink(user.getEmail(), publicUrl + "/auth/magic-link?token=" + raw, lifetime.toMinutes());
    }

    private String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception exception) { throw new IllegalStateException("Unable to hash magic-link token", exception); }
    }

    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Magic link is invalid, expired, or already used");
    }
}
