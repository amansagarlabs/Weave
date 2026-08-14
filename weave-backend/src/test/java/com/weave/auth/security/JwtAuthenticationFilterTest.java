package com.weave.auth.security;

import com.weave.auth.service.JwtService;
import com.weave.auth.service.WeaveUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {
    @Mock JwtService jwtService;
    @Mock WeaveUserDetailsService users;
    @Mock HttpServletRequest request;
    @Mock HttpServletResponse response;
    @Mock FilterChain chain;

    @AfterEach
    void clearSecurityContext() { SecurityContextHolder.clearContext(); }

    @Test
    void validBearerTokenAddsAuthenticationToContext() throws Exception {
        UserDetails details = User.withUsername("creator@example.com").password("hash").roles("CREATOR").build();
        when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
        when(jwtService.subject("valid-token")).thenReturn("creator@example.com");
        when(users.loadUserByUsername("creator@example.com")).thenReturn(details);

        new JwtAuthenticationFilter(jwtService, users).doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("creator@example.com", SecurityContextHolder.getContext().getAuthentication().getName());
        verify(chain).doFilter(request, response);
    }

    @Test
    void invalidBearerTokenRemainsUnauthenticatedAndContinuesChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid-token");
        when(jwtService.subject("invalid-token")).thenThrow(new RuntimeException("expired"));

        new JwtAuthenticationFilter(jwtService, users).doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
        verifyNoInteractions(users);
    }
}
