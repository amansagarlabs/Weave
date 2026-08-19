package com.weave.organization.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "organization_memberships", uniqueConstraints = @UniqueConstraint(name = "uq_organization_membership", columnNames = {"organization_id", "user_id"}))
public class OrganizationMembership {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long organizationId;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false, length = 20) private String role;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();

    protected OrganizationMembership() { }

    public static OrganizationMembership owner(Long organizationId, Long userId) {
        OrganizationMembership membership = new OrganizationMembership();
        membership.organizationId = organizationId;
        membership.userId = userId;
        membership.role = "OWNER";
        return membership;
    }

    public static OrganizationMembership member(Long organizationId, Long userId) {
        OrganizationMembership membership = new OrganizationMembership();
        membership.organizationId = organizationId;
        membership.userId = userId;
        membership.role = "MEMBER";
        return membership;
    }

    public Long getId() { return id; }
    public Long getOrganizationId() { return organizationId; }
    public Long getUserId() { return userId; }
    public String getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
}
