package com.weave.organization.controller;

import com.weave.organization.dto.AdminOrganizationResponse;
import com.weave.organization.service.OrganizationService;
import com.weave.admin.service.AdminAuditService;
import java.security.Principal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin/organizations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrganizationController {
    private final OrganizationService organizations;
    private final AdminAuditService audit;

    public AdminOrganizationController(OrganizationService organizations, AdminAuditService audit) { this.organizations = organizations; this.audit = audit; }

    @GetMapping
    List<AdminOrganizationResponse> all() { return organizations.adminList(); }

    @PatchMapping("/{id}/disable")
    AdminOrganizationResponse disable(@PathVariable Long id, Principal principal) { AdminOrganizationResponse response = organizations.adminSetDisabled(id, true); audit.record(principal.getName(), "ORGANIZATION_DISABLED", "ORGANIZATION", id, "Organization disabled"); return response; }

    @PatchMapping("/{id}/restore")
    AdminOrganizationResponse restore(@PathVariable Long id, Principal principal) { AdminOrganizationResponse response = organizations.adminSetDisabled(id, false); audit.record(principal.getName(), "ORGANIZATION_RESTORED", "ORGANIZATION", id, "Organization restored"); return response; }
}
