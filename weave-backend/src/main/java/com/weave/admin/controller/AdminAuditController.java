package com.weave.admin.controller;

import com.weave.admin.dto.AdminAuditEventResponse;
import com.weave.admin.service.AdminAuditService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {
    private final AdminAuditService audit;
    public AdminAuditController(AdminAuditService audit) { this.audit = audit; }

    @GetMapping
    List<AdminAuditEventResponse> list() { return audit.list(); }
}
