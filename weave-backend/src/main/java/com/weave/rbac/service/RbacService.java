package com.weave.rbac.service;

import com.weave.rbac.dto.RbacPolicyResponse;
import com.weave.rbac.entity.RbacPolicy;
import com.weave.rbac.repository.RbacPolicyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service("rbac")
public class RbacService {
    private final RbacPolicyRepository policies;
    public RbacService(RbacPolicyRepository policies) { this.policies = policies; }

    public boolean can(Authentication authentication, String resource, String action) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        if (authentication.getAuthorities().stream().anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()))) return true;
        String role = authentication.getAuthorities().stream().map(authority -> authority.getAuthority()).filter(value -> value.startsWith("ROLE_")).map(value -> value.substring(5)).findFirst().orElse("");
        return policies.findByRoleAndResourceAndAction(role, resource, action).map(RbacPolicy::isAllowed).orElse(false);
    }

    @Transactional(readOnly = true)
    public List<RbacPolicyResponse> list() { return policies.findAllByOrderByRoleAscResourceAscActionAsc().stream().map(RbacPolicyResponse::from).toList(); }

    @Transactional
    public RbacPolicyResponse update(Long id, boolean allowed) {
        RbacPolicy policy = policies.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "RBAC policy not found"));
        if ("ADMIN".equals(policy.getRole()) && !allowed) throw new ResponseStatusException(HttpStatus.CONFLICT, "Admin access cannot be disabled");
        policy.setAllowed(allowed);
        return RbacPolicyResponse.from(policies.save(policy));
    }
}
