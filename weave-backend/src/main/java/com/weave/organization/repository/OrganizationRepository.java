package com.weave.organization.repository;

import com.weave.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findBySlug(String slug);
    Optional<Organization> findByCreatedByAndPersonalTrue(Long userId);
    boolean existsBySlug(String slug);
}
