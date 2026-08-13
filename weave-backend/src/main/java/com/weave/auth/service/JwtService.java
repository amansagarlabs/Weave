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
        Instant now = Instant.now();
        return Jwts.builder().subject(email).claim("role", role)
                .issuedAt(Date.from(now)).expiration(Date.from(now.plus(tokenLifetime)))
                .signWith(signingKey).compact();
    }

    public String subject(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload().getSubject();
    }
}
