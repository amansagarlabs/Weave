package com.weave.creator.dto;

import com.weave.creator.entity.PortfolioAsset;
import java.time.Instant;

public record PortfolioAssetResponse(Long id, String title, String assetUrl, String contentType, Long sizeBytes, Instant createdAt) {
    public static PortfolioAssetResponse from(PortfolioAsset asset) {
        return new PortfolioAssetResponse(asset.getId(), asset.getTitle(), asset.getAssetUrl(), asset.getContentType(), asset.getSizeBytes(), asset.getCreatedAt());
    }
}
