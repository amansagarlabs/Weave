package com.weave.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final Duration tokenLifetime;

    public JwtService(
            @Value("${weave.jwt.secret}") String secret,
            @Value("${weave.jwt.expiration:PT24H}") Duration tokenLifetime
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.tokenLifetime = tokenLifetime;
    }

    public String issue(String email, String role) {
        return issue(email, role, tokenLifetime, null);
    }

    public String issueChallenge(String email, String purpose, Duration lifetime) {
        return issue(email, null, lifetime, purpose);
    }

    public String subject(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public String subjectForPurpose(String token, String purpose) {
        var claims = Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
        String tokenPurpose = Optional.ofNullable(claims.get("purpose", String.class)).orElse("");
        if (!purpose.equals(tokenPurpose)) {
            throw new IllegalArgumentException("Invalid token purpose");
        }
        return claims.getSubject();
    }

    private String issue(String email, String role, Duration lifetime, String purpose) {
        Instant now = Instant.now();
        var builder = Jwts.builder().subject(email).issuedAt(Date.from(now)).expiration(Date.from(now.plus(lifetime)));
        if (role != null) builder.claim("role", role);
        if (purpose != null) builder.claim("purpose", purpose);
        return builder.signWith(signingKey).compact();
    }
}
