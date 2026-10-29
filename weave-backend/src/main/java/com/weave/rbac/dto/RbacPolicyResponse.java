package com.weave.rbac.dto;

import com.weave.rbac.entity.RbacPolicy;
import java.time.Instant;

public record RbacPolicyResponse(Long id, String role, String resource, String action, boolean allowed, Instant updatedAt) {
    public static RbacPolicyResponse from(RbacPolicy policy) { return new RbacPolicyResponse(policy.getId(), policy.getRole(), policy.getResource(), policy.getAction(), policy.isAllowed(), policy.getUpdatedAt()); }
}
