package com.weave.auth.repository;

import com.weave.auth.entity.AuthAuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthAuditEventRepository extends JpaRepository<AuthAuditEvent, Long> {
    List<AuthAuditEvent> findTop200ByOrderByCreatedAtDesc();
}
