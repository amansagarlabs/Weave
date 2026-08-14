package com.weave.auth.service;

import com.weave.auth.dto.AuthResponse;
import com.weave.auth.dto.LoginRequest;
import com.weave.auth.dto.SignupRequest;
import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository users;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwtService;

    private AuthService service() { return new AuthService(users, passwordEncoder, authenticationManager, jwtService); }

    @Test
    void signupNormalizesEmailEncodesPasswordAndIssuesRoleToken() {
        when(users.findByEmail("creator@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("12345678")).thenReturn("encoded");
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.issue("creator@example.com", "CREATOR")).thenReturn("token");

        AuthResponse response = service().signup(new SignupRequest(" Creator@Example.com ", null, "12345678", "creator"));

        assertEquals("token", response.accessToken());
        assertEquals("creator@example.com", response.user().email());
        assertEquals("CREATOR", response.user().role());
        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertEquals("encoded", saved.getValue().getPasswordHash());
        assertEquals(Role.CREATOR, saved.getValue().getRole());
    }

    @Test
    void duplicateEmailReturnsConflictWithoutSaving() {
        when(users.findByEmail("existing@example.com")).thenReturn(Optional.of(User.create("existing@example.com", null, "hash", Role.BRAND)));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service().signup(new SignupRequest("existing@example.com", null, "12345678", "brand")));

        assertEquals(409, exception.getStatusCode().value());
        verify(users, never()).save(any());
        verifyNoInteractions(passwordEncoder, jwtService);
    }

    @Test
    void loginNormalizesEmailAuthenticatesAndIssuesToken() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("brand@example.com");
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        User user = User.create("brand@example.com", null, "hash", Role.BRAND);
        when(users.findByEmail("brand@example.com")).thenReturn(Optional.of(user));
        when(jwtService.issue("brand@example.com", "BRAND")).thenReturn("token");

        AuthResponse response = service().login(new LoginRequest(" Brand@Example.com ", "12345678"));

        assertEquals("token", response.accessToken());
        assertEquals("BRAND", response.user().role());
        verify(authenticationManager).authenticate(argThat(token -> "brand@example.com".equals(token.getName()) && "12345678".equals(token.getCredentials())));
    }

    @Test
    void invalidRoleIsRejected() {
        when(users.findByEmail("user@example.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> service().signup(new SignupRequest("user@example.com", null, "12345678", "owner")));
        verify(users, never()).save(any());
    }
}
