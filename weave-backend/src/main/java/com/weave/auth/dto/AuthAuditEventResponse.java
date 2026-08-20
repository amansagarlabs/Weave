package com.weave.auth.dto;

import com.weave.auth.entity.AuthAuditEvent;

import java.time.Instant;

public record AuthAuditEventResponse(Long id, Long userId, String eventType, String outcome, String details, Instant createdAt) {
    public static AuthAuditEventResponse from(AuthAuditEvent event) {
        return new AuthAuditEventResponse(event.getId(), event.getUserId(), event.getEventType(), event.getOutcome(), event.getDetails(), event.getCreatedAt());
    }
}
