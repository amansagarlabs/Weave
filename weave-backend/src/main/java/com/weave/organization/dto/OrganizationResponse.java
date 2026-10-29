package com.weave.organization.dto;

import com.weave.organization.entity.Organization;

public record OrganizationResponse(Long id, String name, String slug, boolean personal, String role, boolean active) {
    public static OrganizationResponse from(Organization organization, String role, boolean active) {
        return new OrganizationResponse(organization.getId(), organization.getName(), organization.getSlug(), organization.isPersonal(), role, active);
    }
}
