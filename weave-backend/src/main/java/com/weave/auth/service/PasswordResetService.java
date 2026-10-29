package com.weave.auth.service;

import com.weave.auth.dto.PasswordResetConfirmRequest;
import com.weave.auth.dto.PasswordResetRequest;
import com.weave.auth.dto.VerificationResponse;
import com.weave.auth.entity.PasswordResetToken;
import com.weave.auth.entity.User;
import com.weave.auth.repository.PasswordResetTokenRepository;
import com.weave.auth.repository.UserRepository;
import com.weave.common.outbox.OutboxService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
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
public class PasswordResetService {
    private final UserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder passwords;
    private final AuthSessionService sessions;
    private final OutboxService outbox;
    private final String publicUrl;
    private final Duration lifetime;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(UserRepository users, PasswordResetTokenRepository tokens, PasswordEncoder passwords,
                                AuthSessionService sessions, OutboxService outbox,
                                @Value("${weave.app.public-url:http://localhost:3000}") String publicUrl,
                                @Value("${weave.auth.password-reset-lifetime:PT1H}") Duration lifetime) {
        this.users = users;
        this.tokens = tokens;
        this.passwords = passwords;
        this.sessions = sessions;
        this.outbox = outbox;
        this.publicUrl = publicUrl.replaceAll("/$", "");
        this.lifetime = lifetime;
    }

    @Transactional
    public VerificationResponse request(PasswordResetRequest request, String requestIp) {
        String email = request.email().trim().toLowerCase();
        users.findByEmail(email).ifPresent(user -> {
            String raw = randomToken();
            PasswordResetToken token = tokens.save(PasswordResetToken.create(user, hash(raw), Instant.now().plus(lifetime), requestIp));
            outbox.enqueue("PASSWORD_RESET", String.valueOf(user.getId()), "password-reset:" + token.getId(),
                    java.util.Map.of("recipient", user.getEmail(), "link", publicUrl + "/password-reset/confirm?token=" + raw,
                            "minutes", Math.max(1L, lifetime.toMinutes())));
        });
        return new VerificationResponse(false, "If the account exists, password reset instructions have been sent");
    }

    @Transactional
    public VerificationResponse confirm(PasswordResetConfirmRequest request) {
        PasswordResetToken token = tokens.findByTokenHash(hash(request.token())).orElseThrow(this::invalid);
        if (!token.isActive(Instant.now())) throw invalid();
        User user = token.getUser();
        user.changePassword(passwords.encode(request.password()));
        token.consume();
        users.save(user);
        tokens.save(token);
        sessions.revokeAllForUser(user.getId());
        return new VerificationResponse(true, "Password updated. You can now sign in.");
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to hash password reset token", exception);
        }
    }

    private ResponseStatusException invalid() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password reset link is invalid or expired");
    }
}
