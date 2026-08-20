package com.weave.auth.controller;

import com.weave.auth.dto.AuthResponse;
import com.weave.auth.dto.LoginRequest;
import com.weave.auth.dto.SignupRequest;
import com.weave.auth.dto.SignupResponse;
import com.weave.auth.dto.EmailRequest;
import com.weave.auth.dto.PasswordResetConfirmRequest;
import com.weave.auth.dto.PasswordResetRequest;
import com.weave.auth.dto.MfaChallengeRequest;
import com.weave.auth.dto.MfaCodeRequest;
import com.weave.auth.dto.MfaSetupResponse;
import com.weave.auth.dto.VerificationResponse;
import com.weave.auth.dto.MagicLinkRequest;
import com.weave.auth.dto.MagicLinkVerifyRequest;
import com.weave.auth.service.AuthService;
import com.weave.auth.service.AuthAuditService;
import com.weave.auth.service.AuthSessionService;
import com.weave.auth.service.PasswordResetService;
import com.weave.auth.service.MfaService;
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
    private final PasswordResetService passwordResets;
    private final com.weave.auth.service.MagicLinkService magicLinks;
    private final MfaService mfa;
    private final AuthAuditService audit;

    public AuthController(AuthService authService, AuthSessionService sessions, AuthCookieService cookies, PasswordResetService passwordResets, com.weave.auth.service.MagicLinkService magicLinks, MfaService mfa, AuthAuditService audit) { this.authService = authService; this.sessions = sessions; this.cookies = cookies; this.passwordResets = passwordResets; this.magicLinks = magicLinks; this.mfa = mfa; this.audit = audit; }

    @PostMapping("/signup")
    SignupResponse signup(@Valid @RequestBody SignupRequest request, HttpServletRequest servletRequest) {
        try {
            SignupResponse response = authService.signup(request);
            audit.success("SIGNUP", request.email(), servletRequest, "PASSWORD");
            return response;
        } catch (RuntimeException exception) {
            audit.failure("SIGNUP", request.email(), servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        try {
            AuthResponse result = authService.login(request);
            if (result.mfaRequired()) {
                audit.challenge("PASSWORD_LOGIN", request.email(), servletRequest, "MFA_REQUIRED");
                return result;
            }
            var session = sessions.create(result.user().email(), servletRequest.getHeader("User-Agent"), servletRequest.getRemoteAddr());
            cookies.setSession(servletResponse, session.accessToken(), session.refreshToken());
            audit.success("PASSWORD_LOGIN", result.user().email(), servletRequest, "SESSION_CREATED");
            return new AuthResponse(null, session.user());
        } catch (RuntimeException exception) {
            audit.failure("PASSWORD_LOGIN", request.email(), servletRequest, audit.failureReason(exception));
            throw exception;
        }
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
        try {
            var session = sessions.rotate(cookies.refresh(request), request.getHeader("User-Agent"), request.getRemoteAddr());
            cookies.setSession(response, session.accessToken(), session.refreshToken());
            audit.success("SESSION_REFRESH", session.user().email(), request, "ROTATED");
            return new AuthResponse(null, session.user());
        } catch (RuntimeException exception) {
            audit.failure("SESSION_REFRESH", null, request, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/logout")
    void logout(HttpServletRequest request, HttpServletResponse response, java.security.Principal principal) {
        try {
            sessions.revoke(cookies.refresh(request));
            cookies.clear(response);
            audit.success("LOGOUT", principal == null ? null : principal.getName(), request, "SESSION_REVOKED");
        } catch (RuntimeException exception) {
            audit.failure("LOGOUT", principal == null ? null : principal.getName(), request, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/realtime-token")
    @PreAuthorize("isAuthenticated()")
    RealtimeTokenResponse realtimeToken(HttpServletRequest request) {
        return new RealtimeTokenResponse(authService.realtimeToken(cookies.access(request)));
    }

    @GetMapping("/verify-email")
    VerificationResponse verifyEmail(@RequestParam String token, HttpServletRequest servletRequest) {
        try {
            VerificationResponse response = authService.verifyEmail(token);
            audit.success("EMAIL_VERIFICATION", null, servletRequest, "TOKEN_CONSUMED");
            return response;
        } catch (RuntimeException exception) {
            audit.failure("EMAIL_VERIFICATION", null, servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/resend-verification")
    VerificationResponse resendVerification(@Valid @RequestBody EmailRequest request, HttpServletRequest servletRequest) {
        try {
            authService.resendVerification(request.email());
            audit.success("EMAIL_VERIFICATION_REQUEST", request.email(), servletRequest, "GENERIC_RESPONSE");
            return new VerificationResponse(true, "If the account exists, a new verification email has been sent");
        } catch (RuntimeException exception) {
            audit.failure("EMAIL_VERIFICATION_REQUEST", request.email(), servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/password-reset/request")
    VerificationResponse requestPasswordReset(@Valid @RequestBody PasswordResetRequest request, HttpServletRequest servletRequest) {
        try {
            VerificationResponse response = passwordResets.request(request, servletRequest.getRemoteAddr());
            audit.success("PASSWORD_RESET_REQUEST", request.email(), servletRequest, "GENERIC_RESPONSE");
            return response;
        } catch (RuntimeException exception) {
            audit.failure("PASSWORD_RESET_REQUEST", request.email(), servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/password-reset/confirm")
    VerificationResponse confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request, HttpServletRequest servletRequest) {
        try {
            VerificationResponse response = passwordResets.confirm(request);
            audit.success("PASSWORD_RESET_COMPLETED", null, servletRequest, "SESSIONS_REVOKED");
            return response;
        } catch (RuntimeException exception) {
            audit.failure("PASSWORD_RESET_COMPLETED", null, servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/magic-link/request")
    VerificationResponse requestMagicLink(@Valid @RequestBody MagicLinkRequest request, HttpServletRequest servletRequest) {
        try {
            VerificationResponse response = magicLinks.request(request);
            audit.success("MAGIC_LINK_REQUEST", request.email(), servletRequest, "GENERIC_RESPONSE");
            return response;
        } catch (RuntimeException exception) {
            audit.failure("MAGIC_LINK_REQUEST", request.email(), servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/magic-link/verify")
    AuthResponse verifyMagicLink(@Valid @RequestBody MagicLinkVerifyRequest request, HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        try {
            var user = magicLinks.consume(request.token());
            if (user.isMfaEnabled()) {
                audit.challenge("MAGIC_LINK_LOGIN", user.getEmail(), servletRequest, "MFA_REQUIRED");
                return AuthResponse.mfaRequired(user, mfa.issueLoginChallenge(user.getEmail()));
            }
            var session = sessions.create(user.getEmail(), servletRequest.getHeader("User-Agent"), servletRequest.getRemoteAddr());
            cookies.setSession(servletResponse, session.accessToken(), session.refreshToken());
            audit.success("MAGIC_LINK_LOGIN", user.getEmail(), servletRequest, "SESSION_CREATED");
            return new AuthResponse(null, session.user());
        } catch (RuntimeException exception) {
            audit.failure("MAGIC_LINK_LOGIN", null, servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/mfa/setup")
    @PreAuthorize("isAuthenticated()")
    MfaSetupResponse setupMfa(java.security.Principal principal, HttpServletRequest servletRequest) {
        try {
            MfaSetupResponse response = mfa.setup(principal.getName());
            audit.success("MFA_SETUP", principal.getName(), servletRequest, "RECOVERY_CODES_ISSUED");
            return response;
        } catch (RuntimeException exception) {
            audit.failure("MFA_SETUP", principal.getName(), servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/mfa/enable")
    @PreAuthorize("isAuthenticated()")
    VerificationResponse enableMfa(java.security.Principal principal, @Valid @RequestBody MfaCodeRequest request, HttpServletRequest servletRequest) {
        try {
            VerificationResponse response = mfa.enable(principal.getName(), request);
            audit.success("MFA_ENABLED", principal.getName(), servletRequest, "TOTP_VERIFIED");
            return response;
        } catch (RuntimeException exception) {
            audit.failure("MFA_ENABLED", principal.getName(), servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/mfa/disable")
    @PreAuthorize("isAuthenticated()")
    VerificationResponse disableMfa(java.security.Principal principal, @Valid @RequestBody MfaCodeRequest request, HttpServletRequest servletRequest) {
        try {
            VerificationResponse response = mfa.disable(principal.getName(), request);
            audit.success("MFA_DISABLED", principal.getName(), servletRequest, "CODE_VERIFIED");
            return response;
        } catch (RuntimeException exception) {
            audit.failure("MFA_DISABLED", principal.getName(), servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }

    @PostMapping("/mfa/verify")
    AuthResponse verifyMfa(@Valid @RequestBody MfaChallengeRequest request, HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        try {
            var user = mfa.completeLogin(request);
            var session = sessions.create(user.getEmail(), servletRequest.getHeader("User-Agent"), servletRequest.getRemoteAddr());
            cookies.setSession(servletResponse, session.accessToken(), session.refreshToken());
            audit.success("MFA_LOGIN", user.getEmail(), servletRequest, "SESSION_CREATED");
            return new AuthResponse(null, session.user());
        } catch (RuntimeException exception) {
            audit.failure("MFA_LOGIN", null, servletRequest, audit.failureReason(exception));
            throw exception;
        }
    }
}

record RealtimeTokenResponse(String token) {}
