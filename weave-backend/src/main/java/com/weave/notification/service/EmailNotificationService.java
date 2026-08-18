package com.weave.notification.service;

import com.weave.auth.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EmailNotificationService {
    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);
    private final JavaMailSender mail;
    private final boolean enabled;
    private final String from;
    private final String provider;
    private final String resendApiKey;
    private final String resendApiBaseUrl;
    private final RestClient.Builder restClient;

    public EmailNotificationService(JavaMailSender mail, @Value("${weave.notifications.email.enabled:false}") boolean enabled,
                                    @Value("${weave.notifications.email.from:no-reply@weave.local}") String from,
                                    @Value("${weave.notifications.email.provider:smtp}") String provider,
                                    @Value("${weave.notifications.email.resend-api-key:}") String resendApiKey,
                                    @Value("${weave.notifications.email.resend-api-base-url:https://api.resend.com}") String resendApiBaseUrl,
                                    RestClient.Builder restClient) {
        this.mail = mail;
        this.enabled = enabled;
        this.from = from;
        this.provider = provider;
        this.resendApiKey = resendApiKey;
        this.resendApiBaseUrl = resendApiBaseUrl.replaceAll("/$", "");
        this.restClient = restClient;
    }

    public void send(User recipient, String title, String detail) {
        if (!enabled || recipient.getNotificationPreference() == null || SetOfPreferences.suppressesEmail(recipient.getNotificationPreference())) return;
        try {
            deliver(recipient.getEmail(), "[Weave] " + title, detail + "\n\nOpen Weave to continue.");
        } catch (RuntimeException exception) {
            log.warn("email notification failed userId={} title={}", recipient.getId(), title, exception);
            throw exception;
        }
    }

    public void sendVerification(String recipient, String link, long hours) {
        if (!enabled) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email delivery is not configured");
        try {
            deliver(recipient, "Confirm your Weave email", "Confirm your Weave account by opening this link:\n\n" + link
                    + "\n\nThis link expires in " + hours + " hours.");
        } catch (RuntimeException exception) {
            log.warn("verification email failed recipient={}", recipient, exception);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Could not send verification email");
        }
    }

    public void sendPasswordReset(String recipient, String link, long minutes) {
        if (!enabled) return;
        deliver(recipient, "Reset your Weave password", "Reset your Weave password by opening this link:\n\n" + link
                + "\n\nThis link expires in " + minutes + " minutes.");
    }

    public boolean isConfigured() {
        return enabled && ("resend".equalsIgnoreCase(provider) ? !resendApiKey.isBlank() : !from.isBlank());
    }

    private void deliver(String recipient, String subject, String text) {
        if ("resend".equalsIgnoreCase(provider)) {
            if (resendApiKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Resend is not configured");
            restClient.build().post().uri(resendApiBaseUrl + "/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(java.util.Map.of("from", from, "to", java.util.List.of(recipient), "subject", subject, "text", text))
                    .retrieve().toBodilessEntity();
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(text);
        mail.send(message);
    }

    private static final class SetOfPreferences {
        private static boolean suppressesEmail(String value) { return "NONE".equalsIgnoreCase(value) || "IN_APP".equalsIgnoreCase(value); }
    }
}
