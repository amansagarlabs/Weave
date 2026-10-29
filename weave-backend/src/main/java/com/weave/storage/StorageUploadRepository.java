package com.weave.storage;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;

public interface StorageUploadRepository extends JpaRepository<StorageUpload, Long> {
    List<StorageUpload> findByStatusAndCreatedAtBefore(String status, Instant before);
}
