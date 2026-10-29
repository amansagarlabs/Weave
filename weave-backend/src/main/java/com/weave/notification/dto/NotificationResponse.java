package com.weave.notification.dto;

import com.weave.notification.entity.Notification;

import java.time.Instant;

public record NotificationResponse(Long id, String title, String detail, String kind, boolean unread, Instant createdAt) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(notification.getId(), notification.getTitle(), notification.getDetail(), notification.getKind(), notification.isUnread(), notification.getCreatedAt());
    }
}
