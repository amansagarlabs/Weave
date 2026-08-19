package com.weave.common.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.weave.common.filter.CorrelationIdFilter;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

public class RateLimitingFilter extends OncePerRequestFilter {
    private final RateLimitRegistry registry;
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(RateLimitRegistry registry, ObjectMapper objectMapper) {
        this.registry = registry;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod()) || category(request) == null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        RateLimitCategory category = category(request);
        if (category == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = clientKey(request, category);
        RateLimitDecision decision = registry.check(category, clientKey);
        response.setHeader("X-RateLimit-Limit", String.valueOf(decision.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(decision.remaining()));
        response.setHeader("X-RateLimit-Reset", String.valueOf(decision.resetAt().getEpochSecond()));

        if (!decision.allowed()) {
            writeTooManyRequests(request, response, category, decision);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String clientKey(HttpServletRequest request, RateLimitCategory category) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean anonymous = authentication == null || authentication instanceof AnonymousAuthenticationToken || !authentication.isAuthenticated() || authentication.getName() == null || authentication.getName().isBlank() || "anonymousUser".equals(authentication.getName());
        if (category == RateLimitCategory.AUTH || anonymous) {
            return "ip:" + remoteAddress(request);
        }
        return "user:" + authentication.getName();
    }

    private RateLimitCategory category(HttpServletRequest request) {
        String method = request.getMethod().toUpperCase();
        String path = request.getRequestURI();

        if (path.startsWith("/auth/")) {
            return RateLimitCategory.AUTH;
        }
        if (path.startsWith("/messages")) {
            return RateLimitCategory.MESSAGES;
        }
        if ("GET".equals(method) && (path.startsWith("/creator/public/") || path.equals("/creator/discover") || path.equals("/editor/discover"))) {
            return RateLimitCategory.DISCOVERY;
        }
        if ("POST".equals(method) && (path.equals("/invoices") || path.startsWith("/invoices/"))) {
            return RateLimitCategory.PAYMENT_LINK;
        }
        if (path.equals("/webhooks/unibee")) {
            return RateLimitCategory.WEBHOOK;
        }
        return null;
    }

    private String remoteAddress(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return Optional.ofNullable(request.getRemoteAddr()).filter(value -> !value.isBlank()).orElse("unknown");
    }

    private void writeTooManyRequests(HttpServletRequest request, HttpServletResponse response, RateLimitCategory category, RateLimitDecision decision) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("Retry-After", String.valueOf(decision.retryAfterSeconds()));
        response.setHeader("X-RateLimit-Limit", String.valueOf(decision.limit()));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Reset", String.valueOf(decision.resetAt().getEpochSecond()));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String correlationId = Optional.ofNullable(request.getAttribute(CorrelationIdFilter.REQUEST_ATTRIBUTE))
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .filter(value -> !value.isBlank())
                .orElseGet(() -> Optional.ofNullable(request.getHeader(CorrelationIdFilter.HEADER_NAME)).filter(value -> !value.isBlank()).orElse("unknown"));
        Map<String, Object> payload = Map.of(
                "timestamp", Instant.now().toString(),
                "status", 429,
                "error", "Too many requests",
                "path", request.getRequestURI(),
                "correlationId", correlationId,
                "fieldErrors", Map.of(),
                "category", category.name(),
                "retryAfterSeconds", decision.retryAfterSeconds()
        );
        response.getWriter().write(objectMapper.writeValueAsString(payload));
    }
}
