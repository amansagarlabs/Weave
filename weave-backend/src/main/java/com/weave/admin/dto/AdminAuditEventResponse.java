package com.weave.admin.dto;

import com.weave.admin.entity.AdminAuditEvent;
import java.time.Instant;

public record AdminAuditEventResponse(Long id, Long adminUserId, String action, String targetType, Long targetId, String details, Instant createdAt) {
    public static AdminAuditEventResponse from(AdminAuditEvent event) {
        return new AdminAuditEventResponse(event.getId(), event.getAdminUserId(), event.getAction(), event.getTargetType(), event.getTargetId(), event.getDetails(), event.getCreatedAt());
    }
}
