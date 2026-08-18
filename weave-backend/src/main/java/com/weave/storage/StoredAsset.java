package com.weave.storage;

public record StoredAsset(String legacyUrl, String publicId, String resourceType, String format, Long version) {
    public static StoredAsset legacy(String url) { return new StoredAsset(url, null, null, null, null); }
    public static StoredAsset cloudinary(String publicId, String resourceType, String format, Long version) {
        return new StoredAsset(null, publicId, resourceType, format, version);
    }
    public boolean isCloudinary() { return publicId != null && resourceType != null && format != null && version != null; }
}
