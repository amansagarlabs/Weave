package com.weave.auth.service;

import com.weave.auth.dto.AuthAuditEventResponse;
import com.weave.auth.entity.AuthAuditEvent;
import com.weave.auth.repository.AuthAuditEventRepository;
import com.weave.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
public class AuthAuditService {
    public static final String SUCCESS = "SUCCESS";
    public static final String FAILURE = "FAILURE";
    public static final String CHALLENGE = "CHALLENGE";

    private static final Logger log = LoggerFactory.getLogger(AuthAuditService.class);
    private final AuthAuditEventRepository events;
    private final UserRepository users;
    private final byte[] hashSecret;

    public AuthAuditService(AuthAuditEventRepository events, UserRepository users,
                            @Value("${weave.auth.audit-hash-secret}") String hashSecret) {
        this.events = events;
        this.users = users;
        this.hashSecret = hashSecret.getBytes(StandardCharsets.UTF_8);
    }

    public void success(String eventType, String email, HttpServletRequest request, String details) {
        record(eventType, SUCCESS, email, request, details);
    }

    public void failure(String eventType, String email, HttpServletRequest request, String details) {
        record(eventType, FAILURE, email, request, details);
    }

    public void challenge(String eventType, String email, HttpServletRequest request, String details) {
        record(eventType, CHALLENGE, email, request, details);
    }

    public void record(String eventType, String outcome, String email, HttpServletRequest request, String details) {
        try {
            String normalizedEmail = normalize(email);
            Long userId = normalizedEmail == null ? null : users.findByEmail(normalizedEmail).map(user -> user.getId()).orElse(null);
            String remoteAddress = request == null ? null : request.getRemoteAddr();
            String userAgent = request == null ? null : request.getHeader("User-Agent");
            events.save(AuthAuditEvent.create(userId, safeCode(eventType, 80), safeOutcome(outcome), hmac(normalizedEmail),
                    hmac(normalize(remoteAddress)), hmac(normalize(userAgent)), safeDetails(details)));
        } catch (RuntimeException exception) {
            log.warn("Unable to persist authentication audit event type={}", eventType);
        }
    }

    public List<AuthAuditEventResponse> list() {
        return events.findTop200ByOrderByCreatedAtDesc().stream().map(AuthAuditEventResponse::from).toList();
    }

    public String failureReason(RuntimeException exception) {
        if (exception instanceof org.springframework.web.server.ResponseStatusException statusException) {
            return "HTTP_" + statusException.getStatusCode().value();
        }
        if (exception instanceof org.springframework.security.core.AuthenticationException) return "AUTHENTICATION_REJECTED";
        return "REQUEST_REJECTED";
    }

    private String hmac(String value) {
        if (value == null) return null;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(hashSecret, "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to hash authentication audit value", exception);
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String safeOutcome(String value) {
        String normalized = safeCode(value, 16);
        if (!List.of(SUCCESS, FAILURE, CHALLENGE).contains(normalized)) throw new IllegalArgumentException("Unsupported auth audit outcome");
        return normalized;
    }

    private String safeCode(String value, int maxLength) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException("Authentication audit code is required");
        String normalized = value.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9_]", "_");
        return normalized.substring(0, Math.min(normalized.length(), maxLength));
    }

    private String safeDetails(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.replaceAll("[\\r\\n\\t]", " ").trim();
        return normalized.substring(0, Math.min(normalized.length(), 200));
    }
}
