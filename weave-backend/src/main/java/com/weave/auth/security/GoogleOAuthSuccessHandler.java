package com.weave.auth.security;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.auth.security.AuthCookieService;
import com.weave.auth.service.AuthSessionService;
import com.weave.auth.service.AuthAuditService;
import com.weave.auth.service.MfaService;
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
    private final AuthSessionService sessions;
    private final AuthCookieService cookies;
    private final MfaService mfa;
    private final AuthAuditService audit;
    private final String publicUrl;

    public GoogleOAuthSuccessHandler(UserRepository users, AuthSessionService sessions, AuthCookieService cookies, MfaService mfa, AuthAuditService audit, @Value("${weave.app.public-url:http://localhost:3000}") String publicUrl) {
        this.users = users;
        this.sessions = sessions;
        this.cookies = cookies;
        this.mfa = mfa;
        this.audit = audit;
        this.publicUrl = publicUrl.replaceAll("/$", "");
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String email = ((OAuth2User) authentication.getPrincipal()).getAttribute("email");
        User user = email == null ? null : users.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (user == null) {
            audit.failure("GOOGLE_LOGIN", email, request, "ACCOUNT_NOT_FOUND");
            getRedirectStrategy().sendRedirect(request, response, publicUrl + "/signup?google=account-not-found");
            return;
        }
        user.markEmailVerified();
        users.save(user);
        if (user.isMfaEnabled()) {
            audit.challenge("GOOGLE_LOGIN", user.getEmail(), request, "MFA_REQUIRED");
            getRedirectStrategy().sendRedirect(request, response, publicUrl + "/auth/mfa?token=" + mfa.issueLoginChallenge(user.getEmail()) + "&provider=google");
            return;
        }
        var session = sessions.create(user.getEmail(), request.getHeader("User-Agent"), request.getRemoteAddr());
        cookies.setSession(response, session.accessToken(), session.refreshToken());
        audit.success("GOOGLE_LOGIN", user.getEmail(), request, "SESSION_CREATED");
        getRedirectStrategy().sendRedirect(request, response, publicUrl + "/auth/callback");
    }
}
