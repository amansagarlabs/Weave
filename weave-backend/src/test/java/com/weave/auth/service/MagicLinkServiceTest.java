package com.weave.auth.service;

import com.weave.auth.dto.MagicLinkRequest;
import com.weave.auth.entity.MagicLinkToken;
import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.repository.MagicLinkTokenRepository;
import com.weave.auth.repository.UserRepository;
import com.weave.notification.service.EmailNotificationService;
import java.time.Duration;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MagicLinkServiceTest {
    @Mock UserRepository users;
    @Mock MagicLinkTokenRepository tokens;
    @Mock EmailNotificationService email;

    private MagicLinkService service() {
        return new MagicLinkService(users, tokens, email, "http://localhost:3000", Duration.ofMinutes(15));
    }

    @Test
    void requestAlwaysReturnsGenericResponseAndIssuesForExistingUser() {
        User user = User.create("person@example.com", null, "hash", Role.CREATOR);
        when(users.findByEmail("person@example.com")).thenReturn(Optional.of(user));
        when(tokens.save(any(MagicLinkToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service().request(new MagicLinkRequest(" Person@Example.com "));

        assertTrue(response.verified());
        assertEquals("If the account exists, a sign-in link has been sent", response.message());
        verify(tokens).deleteByUserId(null);
        verify(tokens).save(any(MagicLinkToken.class));
        verify(email).sendMagicLink(eq("person@example.com"), contains("/auth/magic-link?token="), eq(15L));
    }

    @Test
    void consumeMarksTokenUsedAndVerifiesUser() {
        User user = User.create("person@example.com", null, "hash", Role.CREATOR);
        user.beginEmailVerification("hash", java.time.Instant.now().plusSeconds(60));
        MagicLinkToken token = MagicLinkToken.issue(user, "not-the-raw-token", java.time.Instant.now().plusSeconds(60));
        when(tokens.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(tokens.save(any(MagicLinkToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = service().consume("raw-token");

        assertSame(user, result);
        assertTrue(user.isEmailVerified());
        verify(tokens).save(token);
        verify(users).save(user);
    }

    @Test
    void consumeRejectsMissingOrExpiredToken() {
        when(tokens.findByTokenHash(anyString())).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(ResponseStatusException.class, () -> service().consume("missing"));

        assertEquals(400, error.getStatusCode().value());
        verifyNoInteractions(users, email);
    }
}
