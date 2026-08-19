package com.weave.admin.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "admin_audit_events")
public class AdminAuditEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long adminUserId;
    @Column(nullable = false, length = 80) private String action;
    @Column(nullable = false, length = 80) private String targetType;
    private Long targetId;
    @Column(length = 500) private String details;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();

    protected AdminAuditEvent() { }

    public static AdminAuditEvent create(Long adminUserId, String action, String targetType, Long targetId, String details) {
        AdminAuditEvent event = new AdminAuditEvent();
        event.adminUserId = adminUserId;
        event.action = action;
        event.targetType = targetType;
        event.targetId = targetId;
        event.details = details;
        return event;
    }

    public Long getId() { return id; }
    public Long getAdminUserId() { return adminUserId; }
    public String getAction() { return action; }
    public String getTargetType() { return targetType; }
    public Long getTargetId() { return targetId; }
    public String getDetails() { return details; }
    public Instant getCreatedAt() { return createdAt; }
}
