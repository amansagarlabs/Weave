package com.weave.creator.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "portfolio_assets")
public class PortfolioAsset {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long creatorId;
    @Column(nullable = false, length = 180) private String title;
    @Column(nullable = false, columnDefinition = "TEXT") private String assetUrl;
    @Column(nullable = false, length = 120) private String contentType;
    @Column(nullable = false) private Long sizeBytes;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();

    protected PortfolioAsset() { }

    public static PortfolioAsset create(Long creatorId, String title, String assetUrl, String contentType, long sizeBytes) {
        PortfolioAsset asset = new PortfolioAsset();
        asset.creatorId = creatorId;
        asset.title = title;
        asset.assetUrl = assetUrl;
        asset.contentType = contentType;
        asset.sizeBytes = sizeBytes;
        return asset;
    }

    public void update(String title, String assetUrl, String contentType, Long sizeBytes) {
        this.title = title;
        if (assetUrl != null) this.assetUrl = assetUrl;
        if (contentType != null) this.contentType = contentType;
        if (sizeBytes != null) this.sizeBytes = sizeBytes;
    }

    public Long getId() { return id; }
    public Long getCreatorId() { return creatorId; }
    public String getTitle() { return title; }
    public String getAssetUrl() { return assetUrl; }
    public String getContentType() { return contentType; }
    public Long getSizeBytes() { return sizeBytes; }
    public Instant getCreatedAt() { return createdAt; }
}
