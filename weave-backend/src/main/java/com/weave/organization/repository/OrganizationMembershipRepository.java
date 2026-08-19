package com.weave.organization.repository;

import com.weave.organization.entity.OrganizationMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrganizationMembershipRepository extends JpaRepository<OrganizationMembership, Long> {
    List<OrganizationMembership> findByUserIdOrderByCreatedAtAsc(Long userId);
    Optional<OrganizationMembership> findByOrganizationIdAndUserId(Long organizationId, Long userId);
    boolean existsByOrganizationIdAndUserId(Long organizationId, Long userId);
    long countByOrganizationId(Long organizationId);
}
