package com.weave.notification.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
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

    public NotificationService(UserRepository users, NotificationRepository notifications) {
        this.users = users;
        this.notifications = notifications;
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
