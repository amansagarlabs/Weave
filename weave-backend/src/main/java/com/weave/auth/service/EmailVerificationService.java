package com.weave.auth.service;

import com.weave.auth.dto.VerificationResponse;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.notification.service.EmailNotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class EmailVerificationService {
    private final UserRepository users;
    private final EmailNotificationService email;
    private final String publicUrl;
    private final Duration lifetime;
    private final SecureRandom random = new SecureRandom();

    public EmailVerificationService(UserRepository users, EmailNotificationService email,
                                    @Value("${weave.app.public-url:http://localhost:3000}") String publicUrl,
                                    @Value("${weave.auth.email-verification-lifetime:PT24H}") Duration lifetime) {
        this.users = users;
        this.email = email;
        this.publicUrl = publicUrl.replaceAll("/$", "");
        this.lifetime = lifetime;
    }

    public void start(User user) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        user.beginEmailVerification(hash(token), Instant.now().plus(lifetime));
        users.save(user);
        email.sendVerification(user.getEmail(), publicUrl + "/verify-email?token=" + token, lifetime.toHours());
    }

    public VerificationResponse verify(String token) {
        if (token == null || token.isBlank()) throw invalidToken();
        User user = users.findByEmailVerificationTokenHash(hash(token)).orElseThrow(this::invalidToken);
        if (!user.verifyEmail(Instant.now(), hash(token))) throw invalidToken();
        users.save(user);
        return new VerificationResponse(true, "Email verified. You can now sign in.");
    }

    public void resend(String emailAddress) {
        users.findByEmail(emailAddress.trim().toLowerCase()).filter(user -> !user.isEmailVerified()).ifPresent(this::start);
    }

    private String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception exception) { throw new IllegalStateException("Unable to hash verification token", exception); }
    }

    private ResponseStatusException invalidToken() { return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification link is invalid or expired"); }
}
