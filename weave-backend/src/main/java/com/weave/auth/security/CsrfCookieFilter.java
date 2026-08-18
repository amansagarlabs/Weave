package com.weave.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.HexFormat;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class CsrfCookieFilter extends OncePerRequestFilter {
    public static final String COOKIE = "weave_csrf";
    public static final String HEADER = "X-Weave-CSRF";
    private final boolean secure;
    private final SecureRandom random = new SecureRandom();

    public CsrfCookieFilter(@Value("${weave.auth.secure-cookies:false}") boolean secure) { this.secure = secure; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String cookie = value(request, COOKIE);
        if (!StringUtils.hasText(cookie)) {
            byte[] bytes = new byte[24];
            random.nextBytes(bytes);
            cookie = HexFormat.of().formatHex(bytes);
            response.addHeader("Set-Cookie", ResponseCookie.from(COOKIE, cookie).httpOnly(false).secure(secure).sameSite("Lax").path("/").build().toString());
        }
        if (requiresProtection(request) && value(request, AuthCookieService.ACCESS_COOKIE) != null
                && !constantTimeEquals(cookie, request.getHeader(HEADER))) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "CSRF validation failed");
            return;
        }
        chain.doFilter(request, response);
    }

    private boolean requiresProtection(HttpServletRequest request) {
        return !"GET".equalsIgnoreCase(request.getMethod()) && !"HEAD".equalsIgnoreCase(request.getMethod())
                && !"OPTIONS".equalsIgnoreCase(request.getMethod()) && !request.getRequestURI().startsWith("/auth/login")
                && !request.getRequestURI().startsWith("/auth/signup") && !request.getRequestURI().startsWith("/auth/verify-email");
    }

    private String value(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) if (name.equals(cookie.getName())) return cookie.getValue();
        return null;
    }

    private boolean constantTimeEquals(String expected, String actual) {
        if (expected == null || actual == null) return false;
        return java.security.MessageDigest.isEqual(expected.getBytes(java.nio.charset.StandardCharsets.UTF_8), actual.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
