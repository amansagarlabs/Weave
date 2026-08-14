package com.weave.creator.repository;

import com.weave.creator.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(Long ownerId, String ownerType);
    Optional<Package> findByIdAndOwnerIdAndOwnerType(Long id, Long ownerId, String ownerType);
    Optional<Package> findByIdAndOwnerTypeAndActiveTrue(Long id, String ownerType);
}
