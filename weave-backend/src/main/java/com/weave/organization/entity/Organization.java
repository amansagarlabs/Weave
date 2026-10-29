package com.weave.organization.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "organizations")
public class Organization {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 160) private String name;
    @Column(nullable = false, unique = true, length = 180) private String slug;
    @Column(nullable = false) private boolean personal;
    @Column(nullable = false) private boolean disabled = false;
    @Column(nullable = false) private Long createdBy;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();

    protected Organization() { }

    public static Organization create(String name, String slug, boolean personal, Long createdBy) {
        Organization organization = new Organization();
        organization.name = name;
        organization.slug = slug;
        organization.personal = personal;
        organization.createdBy = createdBy;
        return organization;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public boolean isPersonal() { return personal; }
    public boolean isDisabled() { return disabled; }
    public Long getCreatedBy() { return createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void disable() { this.disabled = true; }
    public void restore() { this.disabled = false; }
}
