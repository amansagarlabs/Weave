package com.weave.auth.security;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.auth.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@ConditionalOnExpression("'${GOOGLE_LOGIN_ENABLED:false}' == 'true' && '${GOOGLE_CLIENT_ID:}' != '' && '${GOOGLE_CLIENT_SECRET:}' != ''")
public class GoogleOAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final UserRepository users;
    private final JwtService jwt;
    private final String publicUrl;

    public GoogleOAuthSuccessHandler(UserRepository users, JwtService jwt, @Value("${weave.app.public-url:http://localhost:3000}") String publicUrl) {
        this.users = users;
        this.jwt = jwt;
        this.publicUrl = publicUrl.replaceAll("/$", "");
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String email = ((OAuth2User) authentication.getPrincipal()).getAttribute("email");
        User user = email == null ? null : users.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (user == null) {
            getRedirectStrategy().sendRedirect(request, response, publicUrl + "/signup?google=account-not-found");
            return;
        }
        user.markEmailVerified();
        users.save(user);
        getRedirectStrategy().sendRedirect(request, response, publicUrl + "/auth/callback?token=" + jwt.issue(user.getEmail(), user.getRole().name()));
    }
}
