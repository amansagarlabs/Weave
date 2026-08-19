package com.weave.creator.repository;

import com.weave.creator.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(Long ownerId, String ownerType);
    List<Package> findByOwnerIdAndOwnerTypeAndOrganizationIdAndActiveTrueOrderByIdAsc(Long ownerId, String ownerType, Long organizationId);
    Optional<Package> findByIdAndOwnerIdAndOwnerType(Long id, Long ownerId, String ownerType);
    Optional<Package> findByIdAndOwnerIdAndOwnerTypeAndOrganizationId(Long id, Long ownerId, String ownerType, Long organizationId);
    Optional<Package> findByIdAndOwnerTypeAndActiveTrue(Long id, String ownerType);
}
