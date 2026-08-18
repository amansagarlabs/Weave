package com.weave.auth.repository;

import com.weave.auth.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {
    Optional<AuthSession> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update AuthSession s set s.revokedAt = CURRENT_TIMESTAMP where s.user.id = :userId and s.revokedAt is null")
    int revokeAllForUser(@Param("userId") Long userId);
}
