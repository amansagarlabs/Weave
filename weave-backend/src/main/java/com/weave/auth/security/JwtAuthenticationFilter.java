package com.weave.auth.security;

import com.weave.auth.service.JwtService;
import com.weave.auth.service.WeaveUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final WeaveUserDetailsService users;
    private final AuthCookieService cookies;

    public JwtAuthenticationFilter(JwtService jwtService, WeaveUserDetailsService users, AuthCookieService cookies) {
        this.jwtService = jwtService;
        this.users = users;
        this.cookies = cookies;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = header != null && header.startsWith("Bearer ") ? header.substring(7) : cookies.access(request);
        if (token != null && !token.isBlank() && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String email = jwtService.subject(token);
                UserDetails details = users.loadUserByUsername(email);
                var authentication = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (RuntimeException ignored) {
                // Invalid/expired tokens are treated as unauthenticated by the security chain.
            }
        }
        chain.doFilter(request, response);
    }
}
