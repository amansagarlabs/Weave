package com.weave.auth.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthCookieService {
    public static final String ACCESS_COOKIE = "weave_access";
    public static final String REFRESH_COOKIE = "weave_refresh";
    private final boolean secure;
    private final Duration accessLifetime;
    private final Duration refreshLifetime;

    public AuthCookieService(@Value("${weave.auth.secure-cookies:false}") boolean secure,
                             @Value("${weave.jwt.expiration:PT15M}") Duration accessLifetime,
                             @Value("${weave.auth.refresh-lifetime:P30D}") Duration refreshLifetime) {
        this.secure = secure;
        this.accessLifetime = accessLifetime;
        this.refreshLifetime = refreshLifetime;
    }

    public void setSession(HttpServletResponse response, String access, String refresh) {
        response.addHeader("Set-Cookie", cookie(ACCESS_COOKIE, access, "/", accessLifetime, true).toString());
        response.addHeader("Set-Cookie", cookie(REFRESH_COOKIE, refresh, "/auth", refreshLifetime, true).toString());
    }

    public void clear(HttpServletResponse response) {
        response.addHeader("Set-Cookie", cookie(ACCESS_COOKIE, "", "/", Duration.ZERO, true).toString());
        response.addHeader("Set-Cookie", cookie(REFRESH_COOKIE, "", "/auth", Duration.ZERO, true).toString());
    }

    public String refresh(HttpServletRequest request) { return value(request, REFRESH_COOKIE); }
    public String access(HttpServletRequest request) { return value(request, ACCESS_COOKIE); }

    private ResponseCookie cookie(String name, String value, String path, Duration maxAge, boolean httpOnly) {
        return ResponseCookie.from(name, value == null ? "" : value).httpOnly(httpOnly).secure(secure).sameSite("Lax").path(path).maxAge(maxAge).build();
    }

    private String value(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) if (name.equals(cookie.getName())) return cookie.getValue();
        return null;
    }
}
