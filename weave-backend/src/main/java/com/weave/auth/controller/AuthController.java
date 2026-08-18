package com.weave.auth.controller;

import com.weave.auth.dto.AuthResponse;
import com.weave.auth.dto.LoginRequest;
import com.weave.auth.dto.SignupRequest;
import com.weave.auth.dto.SignupResponse;
import com.weave.auth.dto.EmailRequest;
import com.weave.auth.dto.VerificationResponse;
import com.weave.auth.service.AuthService;
import com.weave.auth.service.AuthSessionService;
import com.weave.auth.security.AuthCookieService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthSessionService sessions;
    private final AuthCookieService cookies;

    public AuthController(AuthService authService, AuthSessionService sessions, AuthCookieService cookies) { this.authService = authService; this.sessions = sessions; this.cookies = cookies; }

    @PostMapping("/signup")
    SignupResponse signup(@Valid @RequestBody SignupRequest request) { return authService.signup(request); }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        AuthResponse result = authService.login(request);
        var session = sessions.create(result.user().email(), servletRequest.getHeader("User-Agent"), servletRequest.getRemoteAddr());
        cookies.setSession(servletResponse, session.accessToken(), session.refreshToken());
        return new AuthResponse(null, session.user());
    }

    @GetMapping("/session")
    AuthResponse session(HttpServletRequest request) {
        String token = cookies.access(request);
        if (token == null || token.isBlank()) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Authentication required");
        var user = authService.userFromAccessToken(token);
        return new AuthResponse(null, user);
    }

    @PostMapping("/refresh")
    AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        var session = sessions.rotate(cookies.refresh(request), request.getHeader("User-Agent"), request.getRemoteAddr());
        cookies.setSession(response, session.accessToken(), session.refreshToken());
        return new AuthResponse(null, session.user());
    }

    @PostMapping("/logout")
    void logout(HttpServletRequest request, HttpServletResponse response) { sessions.revoke(cookies.refresh(request)); cookies.clear(response); }

    @PostMapping("/realtime-token")
    @PreAuthorize("isAuthenticated()")
    RealtimeTokenResponse realtimeToken(HttpServletRequest request) {
        return new RealtimeTokenResponse(authService.realtimeToken(cookies.access(request)));
    }

    @GetMapping("/verify-email")
    VerificationResponse verifyEmail(@RequestParam String token) { return authService.verifyEmail(token); }

    @PostMapping("/resend-verification")
    VerificationResponse resendVerification(@Valid @RequestBody EmailRequest request) {
        authService.resendVerification(request.email());
        return new VerificationResponse(true, "If the account exists, a new verification email has been sent");
    }
}

record RealtimeTokenResponse(String token) {}
