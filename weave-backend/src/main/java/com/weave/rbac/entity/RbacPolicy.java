package com.weave.rbac.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "rbac_policies", uniqueConstraints = @UniqueConstraint(name = "uq_rbac_policy", columnNames = {"role", "resource", "action"}))
public class RbacPolicy {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 20) private String role;
    @Column(nullable = false, length = 40) private String resource;
    @Column(nullable = false, length = 20) private String action;
    @Column(nullable = false) private boolean allowed;
    @Column(nullable = false) private Instant updatedAt = Instant.now();

    protected RbacPolicy() { }

    public void setAllowed(boolean allowed) { this.allowed = allowed; this.updatedAt = Instant.now(); }
    public Long getId() { return id; }
    public String getRole() { return role; }
    public String getResource() { return resource; }
    public String getAction() { return action; }
    public boolean isAllowed() { return allowed; }
    public Instant getUpdatedAt() { return updatedAt; }
}
