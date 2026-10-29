package com.weave.admin.controller;

import com.weave.admin.dto.AdminAuditEventResponse;
import com.weave.admin.service.AdminAuditService;
import com.weave.auth.dto.AuthAuditEventResponse;
import com.weave.auth.service.AuthAuditService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {
    private final AdminAuditService audit;
    private final AuthAuditService authAudit;
    public AdminAuditController(AdminAuditService audit, AuthAuditService authAudit) { this.audit = audit; this.authAudit = authAudit; }

    @GetMapping
    List<AdminAuditEventResponse> list() { return audit.list(); }

    @GetMapping("/auth")
    List<AuthAuditEventResponse> auth() { return authAudit.list(); }
}
