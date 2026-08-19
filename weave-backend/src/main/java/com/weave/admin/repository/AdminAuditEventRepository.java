package com.weave.admin.repository;

import com.weave.admin.entity.AdminAuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminAuditEventRepository extends JpaRepository<AdminAuditEvent, Long> {
    List<AdminAuditEvent> findTop100ByOrderByCreatedAtDesc();
}
