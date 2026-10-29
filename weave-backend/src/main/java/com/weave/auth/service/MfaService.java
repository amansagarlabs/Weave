package com.weave.auth.service;

import com.weave.auth.dto.MfaChallengeRequest;
import com.weave.auth.dto.MfaCodeRequest;
import com.weave.auth.dto.MfaSetupResponse;
import com.weave.auth.dto.VerificationResponse;
import com.weave.auth.entity.User;
import com.weave.auth.mfa.Totp;
import com.weave.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class MfaService {
    private final UserRepository users;
    private final JwtService jwtService;
    private final Clock clock;
    private final Duration challengeLifetime;
    private final String issuer;
    private final SecureRandom random = new SecureRandom();

    public MfaService(UserRepository users, JwtService jwtService, Clock clock,
                      @Value("${weave.auth.mfa-issuer:Weave}") String issuer,
                      @Value("${weave.auth.mfa-challenge-lifetime:PT5M}") Duration challengeLifetime) {
        this.users = users;
        this.jwtService = jwtService;
        this.clock = clock;
        this.challengeLifetime = challengeLifetime;
        this.issuer = issuer;
    }

    @Transactional
    public MfaSetupResponse setup(String email) {
        User user = user(email);
        if (user.isMfaEnabled()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Multi-factor authentication is already enabled");
        String secret = Totp.generateSecret(random);
        List<String> recoveryCodes = generateRecoveryCodes();
        user.configureMfa(secret, recoveryHashes(recoveryCodes));
        users.save(user);
        return new MfaSetupResponse(secret, Totp.provisioningUri(issuer, user.getEmail(), secret), recoveryCodes, "Scan the secret in your authenticator app, then verify the code to enable MFA.");
    }

    @Transactional
    public VerificationResponse enable(String email, MfaCodeRequest request) {
        User user = user(email);
        if (user.getMfaSecret() == null || user.getMfaSecret().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start MFA setup before enabling it");
        if (!Totp.verify(user.getMfaSecret(), request.code(), clock.instant(), 1)) throw invalidCode();
        user.enableMfa();
        users.save(user);
        return new VerificationResponse(true, "Multi-factor authentication is enabled.");
    }

    @Transactional
    public VerificationResponse disable(String email, MfaCodeRequest request) {
        User user = user(email);
        if (!user.isMfaEnabled() && (user.getMfaSecret() == null || user.getMfaSecret().isBlank())) {
            return new VerificationResponse(true, "Multi-factor authentication is already disabled.");
        }
        if (!matchesCode(user, request.code())) throw invalidCode();
        user.disableMfa();
        users.save(user);
        return new VerificationResponse(true, "Multi-factor authentication is disabled.");
    }

    @Transactional
    public User completeLogin(MfaChallengeRequest request) {
        String email = jwtService.subjectForPurpose(request.token(), "mfa-login");
        User user = user(email);
        if (!user.isMfaEnabled() || user.getMfaSecret() == null || user.getMfaSecret().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "MFA challenge is no longer valid");
        }
        if (Totp.verify(user.getMfaSecret(), request.code(), clock.instant(), 1)) {
            return user;
        }
        if (consumeRecoveryCode(user, request.code())) {
            users.save(user);
            return user;
        }
        throw invalidCode();
    }

    public String issueLoginChallenge(String email) {
        return jwtService.issueChallenge(email, "mfa-login", challengeLifetime);
    }

    private boolean matchesCode(User user, String code) {
        if (Totp.verify(user.getMfaSecret(), code, clock.instant(), 1)) return true;
        return consumeRecoveryCode(user, code);
    }

    private boolean consumeRecoveryCode(User user, String code) {
        String normalized = Totp.normalizeRecoveryCode(code);
        if (normalized.isBlank()) return false;
        List<String> hashes = parseHashes(user.getMfaRecoveryCodeHashes());
        String hash = Totp.hash(normalized);
        if (!hashes.remove(hash)) return false;
        user.setMfaRecoveryCodeHashes(hashes.isEmpty() ? null : String.join("\n", hashes));
        return true;
    }

    private List<String> parseHashes(String hashes) {
        if (hashes == null || hashes.isBlank()) return new ArrayList<>();
        return Arrays.stream(hashes.split("\\R")).map(String::trim).filter(value -> !value.isBlank()).collect(Collectors.toCollection(ArrayList::new));
    }

    private String recoveryHashes(List<String> recoveryCodes) {
        return recoveryCodes.stream().map(code -> Totp.hash(Totp.normalizeRecoveryCode(code))).collect(Collectors.joining("\n"));
    }

    private List<String> generateRecoveryCodes() {
        char[] alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
        List<String> codes = new ArrayList<>();
        for (int index = 0; index < 8; index++) {
            StringBuilder builder = new StringBuilder();
            for (int position = 0; position < 10; position++) {
                builder.append(alphabet[random.nextInt(alphabet.length)]);
            }
            codes.add(builder.substring(0, 4) + "-" + builder.substring(4, 8) + "-" + builder.substring(8));
        }
        return codes;
    }

    private User user(String email) {
        return users.findByEmail(email.trim().toLowerCase()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private ResponseStatusException invalidCode() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "The verification code is invalid or expired");
    }
}
