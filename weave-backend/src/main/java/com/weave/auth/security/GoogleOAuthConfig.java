package com.weave.auth.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

@Configuration
@ConditionalOnExpression("'${GOOGLE_LOGIN_ENABLED:false}' == 'true' && '${GOOGLE_CLIENT_ID:}' != '' && '${GOOGLE_CLIENT_SECRET:}' != ''")
public class GoogleOAuthConfig {
    @Bean
    ClientRegistrationRepository googleClientRegistrationRepository(Environment environment) {
        ClientRegistration google = ClientRegistration.withRegistrationId("google")
                .clientId(environment.getProperty("GOOGLE_CLIENT_ID"))
                .clientSecret(environment.getProperty("GOOGLE_CLIENT_SECRET"))
                .scope("openid", "profile", "email")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://openidconnect.googleapis.com/v1/userinfo")
                .userNameAttributeName("sub")
                .clientName("Google")
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .build();
        return new InMemoryClientRegistrationRepository(google);
    }
}
