package com.weave.common.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
public class OutboxService {
    private final OutboxEventRepository events;
    private final ObjectMapper mapper;

    public OutboxService(OutboxEventRepository events, ObjectMapper mapper) { this.events = events; this.mapper = mapper; }

    @Transactional
    public void enqueue(String type, String aggregateId, String idempotencyKey, Map<String, Object> payload) {
        try {
            events.save(OutboxEvent.create(type, aggregateId, mapper.writeValueAsString(payload), idempotencyKey));
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Could not serialize outbox payload", exception);
        } catch (org.springframework.dao.DataIntegrityViolationException ignored) {
            // Duplicate idempotency keys are already safely represented by the first event.
        }
    }
}
