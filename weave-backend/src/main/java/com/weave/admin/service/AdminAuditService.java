package com.weave.admin.service;

import com.weave.admin.dto.AdminAuditEventResponse;
import com.weave.admin.entity.AdminAuditEvent;
import com.weave.admin.repository.AdminAuditEventRepository;
import com.weave.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class AdminAuditService {
    private final AdminAuditEventRepository events;
    private final UserRepository users;

    public AdminAuditService(AdminAuditEventRepository events, UserRepository users) { this.events = events; this.users = users; }

    @Transactional
    public void record(String adminEmail, String action, String targetType, Long targetId, String details) {
        Long adminId = users.findByEmail(adminEmail).map(user -> user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin not found"));
        events.save(AdminAuditEvent.create(adminId, action, targetType, targetId, details));
    }

    @Transactional(readOnly = true)
    public List<AdminAuditEventResponse> list() { return events.findTop100ByOrderByCreatedAtDesc().stream().map(AdminAuditEventResponse::from).toList(); }
}
