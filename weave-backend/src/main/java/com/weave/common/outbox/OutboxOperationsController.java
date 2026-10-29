package com.weave.common.outbox;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/admin/operations/outbox", "/outbox"})
@PreAuthorize("hasRole('ADMIN')")
public class OutboxOperationsController {
    private final OutboxEventRepository events;

    public OutboxOperationsController(OutboxEventRepository events) { this.events = events; }

    @GetMapping
    List<OutboxSummary> list() {
        return events.findTop100ByOrderByCreatedAtDesc().stream()
                .map(event -> new OutboxSummary(event.getId(), event.getEventType(), event.getStatus(), event.getAttempts(), event.getLastError(), event.getCreatedAt()))
                .toList();
    }

    @PostMapping("/retry/{id}")
    OutboxSummary retry(@PathVariable UUID id) {
        OutboxEvent event = events.findById(id).orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Outbox event not found"));
        event.requeue(); events.save(event);
        return new OutboxSummary(event.getId(), event.getEventType(), event.getStatus(), event.getAttempts(), event.getLastError(), event.getCreatedAt());
    }
}

record OutboxSummary(UUID id, String eventType, String status, int attempts, String lastError, java.time.Instant createdAt) {}
