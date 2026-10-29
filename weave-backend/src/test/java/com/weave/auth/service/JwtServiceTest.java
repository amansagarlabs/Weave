package com.weave.auth.service;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private static final String SECRET = "weave-test-secret-that-is-at-least-32-chars";

    @Test
    void issuedTokenContainsEmailSubjectAndCanBeRead() {
        JwtService service = new JwtService(SECRET, Duration.ofMinutes(5));

        String token = service.issue("creator@example.com", "CREATOR");

        assertEquals("creator@example.com", service.subject(token));
    }

    @Test
    void tokenSignedByAnotherSecretIsRejected() {
        JwtService issuer = new JwtService(SECRET, Duration.ofMinutes(5));
        JwtService verifier = new JwtService("different-test-secret-that-is-32-chars", Duration.ofMinutes(5));

        String token = issuer.issue("creator@example.com", "CREATOR");

        assertThrows(JwtException.class, () -> verifier.subject(token));
    }
}
