package com.weave.creator.repository;

import com.weave.creator.entity.CreatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, Long> {
    Optional<CreatorProfile> findByPublicSlug(String publicSlug);
}
