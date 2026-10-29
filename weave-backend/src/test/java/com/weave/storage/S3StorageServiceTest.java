package com.weave.storage;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class S3StorageServiceTest {
    private final S3StorageService storage = new S3StorageService("", "cloudinary", "auto", "", "", "", "", 1024);

    @Test
    void missingOptionalAssetReturnsNull() {
        assertNull(storage.deliveryUrl(null, null, null, null, null));
    }

    @Test
    void incompleteCloudinaryMetadataStillFailsClosed() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> storage.deliveryUrl(null, "asset-id", "image", null, 1L));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }
}
