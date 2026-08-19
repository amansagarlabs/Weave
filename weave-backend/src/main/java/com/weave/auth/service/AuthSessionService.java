package com.weave.auth.service;

import com.weave.auth.dto.SessionResponse;
import com.weave.auth.entity.AuthSession;
import com.weave.auth.entity.User;
import com.weave.auth.repository.AuthSessionRepository;
import com.weave.auth.repository.UserRepository;
import com.weave.organization.service.OrganizationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class AuthSessionService {
    private final AuthSessionRepository sessions;
    private final UserRepository users;
    private final JwtService jwt;
    private final Duration lifetime;
    private final OrganizationService organizations;
    private final SecureRandom random = new SecureRandom();

    public AuthSessionService(AuthSessionRepository sessions, UserRepository users, JwtService jwt,
                               OrganizationService organizations,
                               @Value("${weave.auth.refresh-lifetime:P30D}") Duration lifetime) {
        this.sessions = sessions;
        this.users = users;
        this.jwt = jwt;
        this.organizations = organizations;
        this.lifetime = lifetime;
    }

    @Transactional
    public SessionResponse create(String email, String userAgent, String ipAddress) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session"));
        organizations.ensureActive(user);
        String raw = randomToken();
        sessions.save(AuthSession.create(user, hash(raw), Instant.now().plus(lifetime), userAgent, ipAddress));
        return new SessionResponse(com.weave.auth.dto.UserResponse.from(user), jwt.issue(user.getEmail(), user.getRole().name()), raw);
    }

    @Transactional
    public SessionResponse rotate(String rawToken, String userAgent, String ipAddress) {
        if (rawToken == null || rawToken.isBlank()) throw invalid();
        AuthSession current = sessions.findByTokenHash(hash(rawToken)).orElseThrow(this::invalid);
        if (!current.isActive(Instant.now())) throw invalid();
        current.revoke();
        sessions.save(current);
        return create(current.getUser().getEmail(), userAgent, ipAddress);
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return;
        sessions.findByTokenHash(hash(rawToken)).ifPresent(session -> { session.revoke(); sessions.save(session); });
    }

    @Transactional
    public void revokeAllForUser(Long userId) { sessions.revokeAllForUser(userId); }

    private String randomToken() { byte[] bytes = new byte[32]; random.nextBytes(bytes); return HexFormat.of().formatHex(bytes); }
    private String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception exception) { throw new IllegalStateException("Unable to hash session token", exception); }
    }
    private ResponseStatusException invalid() { return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired session"); }
}
