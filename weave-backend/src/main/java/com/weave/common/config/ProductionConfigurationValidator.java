package com.weave.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("prod")
public class ProductionConfigurationValidator {
    private final Environment environment;
    private final String jwtSecret;
    private final boolean secureCookies;
    private final String publicUrl;
    private final String allowedOrigins;
    private final String mailProvider;
    private final String mailHost;
    private final boolean mailEnabled;
    private final String mailFrom;
    private final String resendKey;
    private final String storageEndpoint;
    private final String storageBucket;
    private final String storageProvider;

    public ProductionConfigurationValidator(Environment environment,
            @Value("${weave.jwt.secret}") String jwtSecret,
            @Value("${weave.auth.secure-cookies:false}") boolean secureCookies,
            @Value("${weave.app.public-url}") String publicUrl,
            @Value("${weave.cors.allowed-origins}") String allowedOrigins,
            @Value("${weave.notifications.email.provider}") String mailProvider,
            @Value("${spring.mail.host}") String mailHost,
            @Value("${weave.notifications.email.enabled:false}") boolean mailEnabled,
            @Value("${weave.notifications.email.from}") String mailFrom,
            @Value("${weave.notifications.email.resend-api-key:}") String resendKey,
            @Value("${weave.storage.s3.endpoint:}") String storageEndpoint,
            @Value("${weave.storage.s3.bucket:}") String storageBucket,
            @Value("${weave.storage.provider:s3}") String storageProvider) {
        this.environment = environment; this.jwtSecret = jwtSecret; this.secureCookies = secureCookies;
        this.publicUrl = publicUrl; this.allowedOrigins = allowedOrigins; this.mailProvider = mailProvider; this.mailHost = mailHost;
        this.mailEnabled = mailEnabled; this.mailFrom = mailFrom; this.resendKey = resendKey;
        this.storageEndpoint = storageEndpoint; this.storageBucket = storageBucket; this.storageProvider = storageProvider;
    }

    @PostConstruct
    void validate() {
        List<String> errors = new ArrayList<>();
        if (environment.matchesProfiles("demo")) errors.add("SPRING_PROFILES_ACTIVE must not include demo");
        if (jwtSecret.length() < 48 || jwtSecret.contains("change-this") || jwtSecret.contains("replace-with")) errors.add("JWT_SECRET must be a random secret of at least 48 characters");
        if (!secureCookies) errors.add("AUTH_SECURE_COOKIES must be true");
        requireHttps(publicUrl, "APP_PUBLIC_URL", errors);
        if (allowedOrigins.contains("localhost") || allowedOrigins.contains("127.0.0.1")) errors.add("CORS_ALLOWED_ORIGINS must not contain localhost");
        if (!mailEnabled) errors.add("MAIL_ENABLED must be true");
        if ("mailpit".equalsIgnoreCase(mailProvider) || "mailpit".equalsIgnoreCase(mailHost) || "localhost".equalsIgnoreCase(mailHost)) errors.add("Production mail must not use Mailpit or localhost");
        if (mailFrom.isBlank() || mailFrom.endsWith("@weave.local")) errors.add("MAIL_FROM must be a verified production address");
        if ("resend".equalsIgnoreCase(mailProvider) && resendKey.isBlank()) errors.add("RESEND_API_KEY is required for Resend");
        if ("cloudinary".equalsIgnoreCase(storageProvider)) {
            if (blankEnv("CLOUDINARY_CLOUD_NAME") || blankEnv("CLOUDINARY_API_KEY") || blankEnv("CLOUDINARY_API_SECRET")) errors.add("Cloudinary credentials are required");
        } else if (storageEndpoint.isBlank() || storageBucket.isBlank()) errors.add("S3_ENDPOINT and S3_BUCKET are required");
        if (!errors.isEmpty()) throw new IllegalStateException("Invalid production configuration: " + String.join("; ", errors));
    }

    private boolean blankEnv(String name) { String value = System.getenv(name); return value == null || value.isBlank(); }

    private void requireHttps(String value, String name, List<String> errors) {
        try { if (!"https".equalsIgnoreCase(URI.create(value).getScheme())) errors.add(name + " must use HTTPS"); }
        catch (RuntimeException exception) { errors.add(name + " must be a valid HTTPS URL"); }
    }
}
