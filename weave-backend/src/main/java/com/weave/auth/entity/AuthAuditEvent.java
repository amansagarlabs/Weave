package com.weave.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "auth_audit_events")
public class AuthAuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    @Column(nullable = false, length = 80)
    private String eventType;
    @Column(nullable = false, length = 16)
    private String outcome;
    @Column(length = 64)
    private String subjectHash;
    @Column(length = 64)
    private String ipHash;
    @Column(length = 64)
    private String userAgentHash;
    @Column(length = 200)
    private String details;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected AuthAuditEvent() { }

    public static AuthAuditEvent create(Long userId, String eventType, String outcome, String subjectHash,
                                        String ipHash, String userAgentHash, String details) {
        AuthAuditEvent event = new AuthAuditEvent();
        event.userId = userId;
        event.eventType = eventType;
        event.outcome = outcome;
        event.subjectHash = subjectHash;
        event.ipHash = ipHash;
        event.userAgentHash = userAgentHash;
        event.details = details;
        return event;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getEventType() { return eventType; }
    public String getOutcome() { return outcome; }
    public String getSubjectHash() { return subjectHash; }
    public String getIpHash() { return ipHash; }
    public String getUserAgentHash() { return userAgentHash; }
    public String getDetails() { return details; }
    public Instant getCreatedAt() { return createdAt; }
}
