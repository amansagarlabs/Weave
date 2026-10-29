package com.weave.storage;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "storage_uploads")
public class StorageUpload {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(columnDefinition = "TEXT") private String legacyUrl;
    private String publicId;
    private String resourceType;
    private String format;
    private Long version;
    @Column(nullable = false, length = 20) private String status;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    private Instant committedAt;

    protected StorageUpload() { }

    public static StorageUpload pending(StoredAsset asset) {
        StorageUpload upload = new StorageUpload();
        upload.legacyUrl = asset.legacyUrl();
        upload.publicId = asset.publicId();
        upload.resourceType = asset.resourceType();
        upload.format = asset.format();
        upload.version = asset.version();
        upload.status = "PENDING";
        return upload;
    }

    public void commit() { status = "COMMITTED"; committedAt = Instant.now(); }
    public StoredAsset asset() { return new StoredAsset(legacyUrl, publicId, resourceType, format, version); }
    public Long getId() { return id; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
