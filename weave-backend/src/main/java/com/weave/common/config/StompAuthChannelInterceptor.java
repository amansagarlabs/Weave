package com.weave.common.config;

import com.weave.auth.service.JwtService;
import com.weave.auth.service.WeaveUserDetailsService;
import com.weave.message.service.MessageService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.security.Principal;

/** Authenticates the JWT supplied in the STOMP CONNECT frame. */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {
    private final JwtService jwtService;
    private final WeaveUserDetailsService users;
    private final MessageService messages;

    public StompAuthChannelInterceptor(JwtService jwtService, WeaveUserDetailsService users, MessageService messages) {
        this.jwtService = jwtService;
        this.users = users;
        this.messages = messages;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authorization = accessor.getFirstNativeHeader("Authorization");
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                throw new IllegalArgumentException("STOMP authentication is required");
            }
            String email = jwtService.subject(authorization.substring(7));
            UserDetails details = users.loadUserByUsername(email);
            if (!details.isEnabled()) {
                throw new IllegalArgumentException("Account is suspended");
            }
            accessor.setUser(new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities()));
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            Principal principal = accessor.getUser();
            if (destination != null && destination.startsWith("/topic/threads/") && principal != null) {
                messages.authorizeThread(principal.getName(), destination.substring("/topic/threads/".length()));
            }
        }
        return message;
    }
}
