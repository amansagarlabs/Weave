package com.weave.auth.service;

import com.weave.auth.entity.AuthAuditEvent;
import com.weave.auth.repository.AuthAuditEventRepository;
import com.weave.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthAuditServiceTest {
    @Mock AuthAuditEventRepository events;
    @Mock UserRepository users;
    @Mock HttpServletRequest request;

    private AuthAuditService service() {
        return new AuthAuditService(events, users, "test-audit-secret-at-least-32-characters");
    }

    @Test
    void recordStoresOnlyFingerprintsForSubjectAndClientIdentifiers() {
        when(users.findByEmail("person@example.com")).thenReturn(Optional.empty());
        when(request.getRemoteAddr()).thenReturn("192.0.2.44");
        when(request.getHeader("User-Agent")).thenReturn("Example Browser 1.0");

        service().success("password_login", " Person@Example.com ", request, "SESSION_CREATED\nSAFE");

        ArgumentCaptor<AuthAuditEvent> saved = ArgumentCaptor.forClass(AuthAuditEvent.class);
        verify(events).save(saved.capture());
        AuthAuditEvent event = saved.getValue();
        assertEquals("PASSWORD_LOGIN", event.getEventType());
        assertEquals("SUCCESS", event.getOutcome());
        assertNull(event.getUserId());
        assertEquals(64, event.getSubjectHash().length());
        assertEquals(64, event.getIpHash().length());
        assertEquals(64, event.getUserAgentHash().length());
        assertNotEquals("person@example.com", event.getSubjectHash());
        assertNotEquals("192.0.2.44", event.getIpHash());
        assertNotEquals("Example Browser 1.0", event.getUserAgentHash());
        assertFalse(event.getDetails().contains("\n"));
    }

    @Test
    void persistenceFailureNeverBlocksAuthenticationFlow() {
        when(users.findByEmail("person@example.com")).thenReturn(Optional.empty());
        doThrow(new IllegalStateException("database unavailable")).when(events).save(any(AuthAuditEvent.class));

        assertDoesNotThrow(() -> service().failure("PASSWORD_LOGIN", "person@example.com", request, "AUTHENTICATION_REJECTED"));
    }

    @Test
    void unsupportedOutcomeIsRejectedInsideSafeRecordingBoundary() {
        assertDoesNotThrow(() -> service().record("PASSWORD_LOGIN", "UNKNOWN", null, null, null));
    }

    @Test
    void failureReasonExposesStatusClassWithoutLeakingExceptionMessage() {
        String reason = service().failureReason(new ResponseStatusException(HttpStatus.FORBIDDEN, "sensitive reason"));

        assertEquals("HTTP_403", reason);
    }
}
