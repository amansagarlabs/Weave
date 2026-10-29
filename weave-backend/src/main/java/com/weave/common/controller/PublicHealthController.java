package com.weave.common.controller;

import com.weave.notification.service.EmailNotificationService;
import com.weave.storage.S3StorageService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/public/health")
public class PublicHealthController {
    private final JdbcTemplate database;
    private final S3StorageService storage;
    private final EmailNotificationService email;

    public PublicHealthController(JdbcTemplate database, S3StorageService storage, EmailNotificationService email) {
        this.database = database;
        this.storage = storage;
        this.email = email;
    }

    @GetMapping
    HealthResponse health() {
        Map<String, ServiceStatus> services = new LinkedHashMap<>();
        services.put("app", new ServiceStatus("operational", "Weave application"));
        services.put("database", new ServiceStatus(databaseHealthy() ? "operational" : "degraded", "Database"));
        services.put("storage", new ServiceStatus(storage.isHealthy() ? "operational" : "degraded", "Asset storage"));
        services.put("email", new ServiceStatus(email.isConfigured() ? "operational" : "degraded", "Email delivery"));
        boolean healthy = services.values().stream().allMatch(service -> "operational".equals(service.status()));
        return new HealthResponse(healthy ? "operational" : "degraded", Instant.now(), services);
    }

    private boolean databaseHealthy() {
        try { return Integer.valueOf(1).equals(database.queryForObject("SELECT 1", Integer.class)); }
        catch (RuntimeException exception) { return false; }
    }

    public record HealthResponse(String status, Instant checkedAt, Map<String, ServiceStatus> services) { }
    public record ServiceStatus(String status, String label) { }
}
