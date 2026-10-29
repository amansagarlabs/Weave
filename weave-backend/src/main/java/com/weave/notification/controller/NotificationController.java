package com.weave.notification.controller;

import com.weave.notification.dto.NotificationResponse;
import com.weave.notification.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notifications;

    public NotificationController(NotificationService notifications) {
        this.notifications = notifications;
    }

    @GetMapping
    List<NotificationResponse> mine(Authentication authentication) {
        return notifications.mine(authentication.getName());
    }

    @PostMapping("/read-all")
    List<NotificationResponse> markAllRead(Authentication authentication) {
        return notifications.markAllRead(authentication.getName());
    }

    @PostMapping("/{id}/read")
    NotificationResponse markRead(@PathVariable Long id, Authentication authentication) {
        return notifications.markRead(authentication.getName(), id);
    }
}
