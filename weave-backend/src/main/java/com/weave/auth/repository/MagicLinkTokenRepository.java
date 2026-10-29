package com.weave.auth.repository;

import com.weave.auth.entity.MagicLinkToken;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MagicLinkTokenRepository extends JpaRepository<MagicLinkToken, UUID> {
    Optional<MagicLinkToken> findByTokenHash(String tokenHash);
    void deleteByUserId(Long userId);
}
