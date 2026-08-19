package com.weave.common.outbox;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events")
public class OutboxEvent {
    @Id
    private UUID id;
    @Column(nullable = false, length = 120)
    private String eventType;
    @Column(nullable = false, length = 120)
    private String aggregateId;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;
    @Column(nullable = false, unique = true, length = 180)
    private String idempotencyKey;
    @Column(nullable = false, length = 20)
    private String status = "PENDING";
    @Column(nullable = false)
    private int attempts;
    @Column(nullable = false)
    private Instant nextAttemptAt = Instant.now();
    @Column(length = 2000)
    private String lastError;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    private Instant processedAt;

    protected OutboxEvent() { }

    public static OutboxEvent create(String eventType, String aggregateId, String payload, String idempotencyKey) {
        OutboxEvent event = new OutboxEvent();
        event.id = UUID.randomUUID(); event.eventType = eventType; event.aggregateId = aggregateId;
        event.payload = payload; event.idempotencyKey = idempotencyKey;
        return event;
    }

    public UUID getId() { return id; }
    public String getEventType() { return eventType; }
    public String getPayload() { return payload; }
    public String getStatus() { return status; }
    public int getAttempts() { return attempts; }
    public String getLastError() { return lastError; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getProcessedAt() { return processedAt; }
    public void succeed() { status = "SUCCEEDED"; processedAt = Instant.now(); }
    public void retry(String error) {
        attempts++;
        lastError = error == null ? "Unknown worker error" : error.substring(0, Math.min(2000, error.length()));
        if (attempts >= 8) { status = "DEAD"; return; }
        status = "PENDING";
        nextAttemptAt = Instant.now().plusSeconds(Math.min(3600, 15L * (1L << Math.min(attempts, 7))));
    }
    public void claim() { status = "PROCESSING"; attempts++; }
    public void requeue() { status = "PENDING"; nextAttemptAt = Instant.now(); lastError = null; }
}
