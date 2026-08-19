package com.weave.rbac.controller;

import com.weave.admin.service.AdminAuditService;
import com.weave.rbac.dto.RbacPolicyResponse;
import com.weave.rbac.dto.UpdateRbacPolicyRequest;
import com.weave.rbac.service.RbacService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin/rbac")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRbacController {
    private final RbacService rbac;
    private final AdminAuditService audit;
    public AdminRbacController(RbacService rbac, AdminAuditService audit) { this.rbac = rbac; this.audit = audit; }

    @GetMapping("/policies")
    List<RbacPolicyResponse> policies() { return rbac.list(); }

    @PatchMapping("/policies/{id}")
    RbacPolicyResponse update(@PathVariable Long id, @Valid @RequestBody UpdateRbacPolicyRequest request, Authentication authentication) {
        RbacPolicyResponse response = rbac.update(id, request.allowed());
        audit.record(authentication.getName(), "RBAC_POLICY_UPDATED", "RBAC_POLICY", id, response.role() + " " + response.resource() + " " + response.action() + " allowed=" + response.allowed());
        return response;
    }
}
