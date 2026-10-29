package com.weave.notification.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long userId;
    @Column(nullable = false, length = 200)
    private String title;
    @Column(nullable = false, length = 5000)
    private String detail;
    @Column(nullable = false)
    private String kind = "GENERAL";
    @Column(nullable = false)
    private boolean unread = true;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    private Instant readAt;

    protected Notification() { }

    public static Notification create(Long userId, String title, String detail, String kind) {
        Notification notification = new Notification();
        notification.userId = userId;
        notification.title = title;
        notification.detail = detail;
        notification.kind = kind;
        return notification;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getDetail() { return detail; }
    public String getKind() { return kind; }
    public boolean isUnread() { return unread; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getReadAt() { return readAt; }

    public void markRead() {
        unread = false;
        readAt = Instant.now();
    }
}
