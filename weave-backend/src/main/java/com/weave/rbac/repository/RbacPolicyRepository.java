package com.weave.rbac.repository;

import com.weave.rbac.entity.RbacPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RbacPolicyRepository extends JpaRepository<RbacPolicy, Long> {
    Optional<RbacPolicy> findByRoleAndResourceAndAction(String role, String resource, String action);
    List<RbacPolicy> findAllByOrderByRoleAscResourceAscActionAsc();
}
