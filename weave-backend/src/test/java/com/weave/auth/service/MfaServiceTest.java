package com.weave.auth.service;

import com.weave.auth.dto.MfaChallengeRequest;
import com.weave.auth.dto.MfaCodeRequest;
import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.mfa.Totp;
import com.weave.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MfaServiceTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-08-19T10:15:30Z"), ZoneOffset.UTC);

    @Mock UserRepository users;
    @Mock JwtService jwtService;

    private MfaService service() {
        return new MfaService(users, jwtService, CLOCK, "Weave", java.time.Duration.ofMinutes(5));
    }

    @Test
    void setupCreatesSecretAndRecoveryCodesWithoutEnablingMfa() {
        User user = User.create("person@example.com", null, "hash", Role.CREATOR);
        when(users.findByEmail("person@example.com")).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service().setup("person@example.com");

        assertNotNull(response.secret());
        assertTrue(response.otpauthUri().contains("otpauth://totp/Weave:person@example.com"));
        assertEquals(8, response.recoveryCodes().size());
        assertFalse(user.isMfaEnabled());
        assertEquals(response.secret(), user.getMfaSecret());
        verify(users).save(user);
    }

    @Test
    void enableChecksTotpAndMarksMfaEnabled() {
        User user = User.create("person@example.com", null, "hash", Role.CREATOR);
        when(users.findByEmail("person@example.com")).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var setup = service().setup("person@example.com");
        String code = Totp.currentCode(setup.secret(), CLOCK.instant());

        var response = service().enable("person@example.com", new MfaCodeRequest(code));

        assertTrue(response.verified());
        assertTrue(user.isMfaEnabled());
        verify(users, times(2)).save(user);
    }

    @Test
    void completeLoginAcceptsRecoveryCodeAndConsumesIt() {
        User user = User.create("person@example.com", null, "hash", Role.CREATOR);
        when(users.findByEmail("person@example.com")).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.subjectForPurpose("challenge-token", "mfa-login")).thenReturn("person@example.com");

        var setup = service().setup("person@example.com");
        user.enableMfa();
        String recoveryCode = setup.recoveryCodes().getFirst();

        User resolved = service().completeLogin(new MfaChallengeRequest("challenge-token", recoveryCode));

        assertSame(user, resolved);
        assertTrue(user.isMfaEnabled());
        assertNotNull(user.getMfaRecoveryCodeHashes());
        assertEquals(7, user.getMfaRecoveryCodeHashes().split("\\R").length);
    }

    @Test
    void disableClearsSecretAndFlagsAfterTotpVerification() {
        User user = User.create("person@example.com", null, "hash", Role.CREATOR);
        when(users.findByEmail("person@example.com")).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var setup = service().setup("person@example.com");
        user.enableMfa();
        String code = Totp.currentCode(setup.secret(), CLOCK.instant());

        var response = service().disable("person@example.com", new MfaCodeRequest(code));

        assertTrue(response.verified());
        assertFalse(user.isMfaEnabled());
        assertNull(user.getMfaSecret());
        assertNull(user.getMfaRecoveryCodeHashes());
    }
}
