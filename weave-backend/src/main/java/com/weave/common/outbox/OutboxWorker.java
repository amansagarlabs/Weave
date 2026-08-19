package com.weave.common.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.weave.auth.repository.UserRepository;
import com.weave.notification.service.EmailNotificationService;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OutboxWorker {
    private static final Logger log = LoggerFactory.getLogger(OutboxWorker.class);
    private static final String LOCK_KEY = "weave:lock:outbox-worker";
    private static final Duration LOCK_TTL = Duration.ofMinutes(5);
    private static final DefaultRedisScript<Long> RELEASE_SCRIPT = new DefaultRedisScript<>("""
            if redis.call('GET', KEYS[1]) == ARGV[1] then
                return redis.call('DEL', KEYS[1])
            end
            return 0
            """, Long.class);
    private final OutboxEventRepository events;
    private final UserRepository users;
    private final EmailNotificationService email;
    private final ObjectMapper mapper;
    private final ObjectProvider<StringRedisTemplate> redisProvider;

    public OutboxWorker(OutboxEventRepository events, UserRepository users, EmailNotificationService email, ObjectMapper mapper,
                        ObjectProvider<StringRedisTemplate> redisProvider) {
        this.events = events; this.users = users; this.email = email; this.mapper = mapper; this.redisProvider = redisProvider;
    }

    @Scheduled(fixedDelayString = "${weave.outbox.poll-ms:2000}")
    public void process() {
        StringRedisTemplate redis = redisProvider == null ? null : redisProvider.getIfAvailable();
        String lockToken = null;
        boolean locked = false;
        if (redis != null) {
            try {
                lockToken = UUID.randomUUID().toString();
                locked = Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(LOCK_KEY, lockToken, LOCK_TTL));
                if (!locked) {
                    return;
                }
            } catch (RuntimeException exception) {
                log.warn("Redis outbox lock unavailable; continuing without distributed coordination", exception);
            }
        }

        try {
            events.findTop50ByStatusAndNextAttemptAtLessThanEqualOrderByCreatedAtAsc("PENDING", Instant.now())
                    .forEach(this::processOne);
        } finally {
            if (redis != null && locked && lockToken != null) {
                release(redis, lockToken);
            }
        }
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

    private void release(StringRedisTemplate redis, String lockToken) {
        try {
            redis.execute(RELEASE_SCRIPT, List.of(LOCK_KEY), lockToken);
        } catch (RuntimeException exception) {
            log.debug("Could not release outbox Redis lock", exception);
        }
    }
}
