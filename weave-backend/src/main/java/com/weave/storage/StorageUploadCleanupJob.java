package com.weave.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.Instant;

@Service
public class StorageUploadCleanupJob {
    private static final Logger log = LoggerFactory.getLogger(StorageUploadCleanupJob.class);
    private final StorageUploadRepository uploads;
    private final S3StorageService storage;

    public StorageUploadCleanupJob(StorageUploadRepository uploads, S3StorageService storage) {
        this.uploads = uploads;
        this.storage = storage;
    }

    @Transactional
    public StorageUpload begin(StoredAsset asset) {
        return uploads.save(StorageUpload.pending(asset));
    }

    @Transactional
    public void commit(StorageUpload upload) {
        upload.commit();
        uploads.save(upload);
    }

    @Scheduled(fixedDelayString = "${weave.storage.cleanup-ms:3600000}")
    @Transactional
    public void removeStaleUploads() {
        Instant cutoff = Instant.now().minus(Duration.ofHours(1));
        uploads.findByStatusAndCreatedAtBefore("PENDING", cutoff).forEach(upload -> {
            try {
                storage.delete(upload.asset());
                uploads.delete(upload);
            } catch (RuntimeException exception) {
                log.warn("Could not clean up storage upload {}", upload.getId(), exception);
            }
        });
    }
}
