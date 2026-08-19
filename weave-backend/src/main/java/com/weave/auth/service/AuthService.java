package com.weave.auth.service;

import com.weave.auth.dto.AuthResponse;
import com.weave.auth.dto.LoginRequest;
import com.weave.auth.dto.SignupRequest;
import com.weave.auth.dto.SignupResponse;
import com.weave.auth.dto.VerificationResponse;
import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerification;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService, EmailVerificationService emailVerification) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailVerification = emailVerification;
    }

    public SignupResponse signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        Role role = Role.from(request.role());
        User user = users.save(User.create(email, request.phone(), passwordEncoder.encode(request.password()), role));
        emailVerification.start(user);
        return new SignupResponse(user.getEmail(), true, "Check your email to activate your account");
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));
        User user = users.findByEmail(authentication.getName()).orElseThrow();
        if (!user.isEmailVerified()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your email before signing in");
        if (user.isMfaEnabled()) return AuthResponse.mfaRequired(user, jwtService.issueChallenge(user.getEmail(), "mfa-login", java.time.Duration.ofMinutes(5)));
        return AuthResponse.of(jwtService.issue(user.getEmail(), user.getRole().name()), user);
    }

    public VerificationResponse verifyEmail(String token) { return emailVerification.verify(token); }
    public void resendVerification(String email) { emailVerification.resend(email); }
    public com.weave.auth.dto.UserResponse userFromAccessToken(String token) {
        User user = users.findByEmail(jwtService.subject(token)).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session"));
        if (user.isSuspended()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is suspended");
        return com.weave.auth.dto.UserResponse.from(user);
    }

    public String realtimeToken(String accessToken) {
        var user = userFromAccessToken(accessToken);
        return jwtService.issue(user.email(), user.role());
    }
}
