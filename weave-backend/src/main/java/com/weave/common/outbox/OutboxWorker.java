package com.weave.common.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.weave.auth.repository.UserRepository;
import com.weave.notification.service.EmailNotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Map;

@Component
public class OutboxWorker {
    private final OutboxEventRepository events;
    private final UserRepository users;
    private final EmailNotificationService email;
    private final ObjectMapper mapper;

    public OutboxWorker(OutboxEventRepository events, UserRepository users, EmailNotificationService email, ObjectMapper mapper) {
        this.events = events; this.users = users; this.email = email; this.mapper = mapper;
    }

    @Scheduled(fixedDelayString = "${weave.outbox.poll-ms:2000}")
    public void process() {
        events.findTop50ByStatusAndNextAttemptAtLessThanEqualOrderByCreatedAtAsc("PENDING", Instant.now())
                .forEach(this::processOne);
    }

    @Transactional
    protected void processOne(OutboxEvent event) {
        event.claim(); events.save(event);
        try {
            if ("EMAIL_NOTIFICATION".equals(event.getEventType())) {
                Map<?, ?> payload = mapper.readValue(event.getPayload(), Map.class);
                users.findById(Long.valueOf(String.valueOf(payload.get("userId"))))
                        .ifPresent(user -> email.send(user, String.valueOf(payload.get("title")), String.valueOf(payload.get("detail"))));
            } else if ("PASSWORD_RESET".equals(event.getEventType())) {
                Map<?, ?> payload = mapper.readValue(event.getPayload(), Map.class);
                email.sendPasswordReset(String.valueOf(payload.get("recipient")), String.valueOf(payload.get("link")),
                        Long.parseLong(String.valueOf(payload.get("minutes"))));
            }
            event.succeed();
        } catch (Exception exception) {
            event.retry(exception.getMessage());
        }
        events.save(event);
    }
}
