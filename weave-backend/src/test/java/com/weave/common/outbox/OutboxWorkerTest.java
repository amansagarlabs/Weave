package com.weave.common.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.notification.service.EmailNotificationService;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class OutboxWorkerTest {
    @Test
    void skipsProcessingWhenRedisLockIsHeldElsewhere() {
        OutboxEventRepository events = mock(OutboxEventRepository.class);
        UserRepository users = mock(UserRepository.class);
        EmailNotificationService email = mock(EmailNotificationService.class);
        ObjectMapper mapper = new ObjectMapper();
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        ValueOperations<String, String> values = mock(ValueOperations.class);
        ObjectProvider<StringRedisTemplate> redisProvider = mock(ObjectProvider.class);
        when(redisProvider.getIfAvailable()).thenReturn(redis);
        when(redis.opsForValue()).thenReturn(values);
        when(values.setIfAbsent(eq("weave:lock:outbox-worker"), any(String.class), eq(Duration.ofMinutes(5)))).thenReturn(false);

        new OutboxWorker(events, users, email, mapper, redisProvider).process();

        verifyNoInteractions(events, users, email);
    }

    @Test
    void processesOutboxWhenLockIsAcquired() {
        OutboxEventRepository events = mock(OutboxEventRepository.class);
        UserRepository users = mock(UserRepository.class);
        EmailNotificationService email = mock(EmailNotificationService.class);
        ObjectMapper mapper = new ObjectMapper();
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        ValueOperations<String, String> values = mock(ValueOperations.class);
        ObjectProvider<StringRedisTemplate> redisProvider = mock(ObjectProvider.class);
        when(redisProvider.getIfAvailable()).thenReturn(redis);
        when(redis.opsForValue()).thenReturn(values);
        when(values.setIfAbsent(eq("weave:lock:outbox-worker"), any(String.class), eq(Duration.ofMinutes(5)))).thenReturn(true);

        User recipient = mock(User.class);
        when(recipient.getNotificationPreference()).thenReturn("EMAIL");
        when(recipient.getEmail()).thenReturn("recipient@example.com");
        when(users.findById(1L)).thenReturn(Optional.of(recipient));
        when(events.findTop50ByStatusAndNextAttemptAtLessThanEqualOrderByCreatedAtAsc(eq("PENDING"), any(Instant.class))).thenReturn(List.of(
                OutboxEvent.create("EMAIL_NOTIFICATION", "1", "{\"userId\":1,\"title\":\"Invoice created\",\"detail\":\"Body\"}", "notification:1")
        ));

        new OutboxWorker(events, users, email, mapper, redisProvider).process();

        verify(email).send(recipient, "Invoice created", "Body");
        verify(events, org.mockito.Mockito.times(2)).save(any(OutboxEvent.class));
    }
}
