package com.weave.notification.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.common.outbox.OutboxService;
import com.weave.notification.dto.NotificationResponse;
import com.weave.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class NotificationService {
    private final UserRepository users;
    private final NotificationRepository notifications;
    private final OutboxService outbox;

    public NotificationService(UserRepository users, NotificationRepository notifications, OutboxService outbox) {
        this.users = users; this.notifications = notifications; this.outbox = outbox;
    }

    @Transactional
    public void create(Long userId, String title, String detail, String kind) {
        var notification = notifications.save(com.weave.notification.entity.Notification.create(userId, title, detail, kind));
        outbox.enqueue("EMAIL_NOTIFICATION", String.valueOf(userId), "notification:" + notification.getId(),
                java.util.Map.of("userId", userId, "title", title, "detail", detail));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> mine(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        return notifications.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(NotificationResponse::from).toList();
    }

    @Transactional
    public List<NotificationResponse> markAllRead(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        List<com.weave.notification.entity.Notification> items = notifications.findByUserIdOrderByCreatedAtDesc(user.getId());
        items.stream().filter(com.weave.notification.entity.Notification::isUnread).forEach(com.weave.notification.entity.Notification::markRead);
        return items.stream().map(NotificationResponse::from).toList();
    }
}
