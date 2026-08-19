package com.weave.creator.repository;

import com.weave.creator.entity.PortfolioAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PortfolioAssetRepository extends JpaRepository<PortfolioAsset, Long> {
    List<PortfolioAsset> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
}
