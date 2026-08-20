package com.weave.creator.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.creator.dto.PortfolioAssetResponse;
import com.weave.creator.entity.PortfolioAsset;
import com.weave.creator.repository.PortfolioAssetRepository;
import com.weave.creator.repository.CreatorProfileRepository;
import com.weave.storage.S3StorageService;
import com.weave.storage.StorageUploadCleanupJob;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class PortfolioAssetService {
    private final PortfolioAssetRepository assets;
    private final UserRepository users;
    private final CreatorProfileRepository profiles;
    private final S3StorageService storage;
    private final StorageUploadCleanupJob uploadCleanup;

    public PortfolioAssetService(PortfolioAssetRepository assets, UserRepository users, CreatorProfileRepository profiles, S3StorageService storage, StorageUploadCleanupJob uploadCleanup) {
        this.assets = assets; this.users = users; this.profiles = profiles; this.storage = storage; this.uploadCleanup = uploadCleanup;
    }

    @Transactional(readOnly = true)
    public List<PortfolioAssetResponse> mine(String email) {
        User creator = creator(email);
        return assets.findByCreatorIdOrderByCreatedAtDesc(creator.getId()).stream().map(PortfolioAssetResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PortfolioAssetResponse> publicForSlug(String slug) {
        Long creatorId = profiles.findByPublicSlugIgnoreCase(slug.trim()).map(profile -> profile.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator profile not found"));
        return assets.findByCreatorIdOrderByCreatedAtDesc(creatorId).stream().map(PortfolioAssetResponse::from).toList();
    }

    @Transactional
    public PortfolioAssetResponse upload(String email, String title, MultipartFile file) {
        User creator = creator(email);
        if (title == null || title.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portfolio title is required");
        if (title.trim().length() > 180) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portfolio title is too long");
        var stored = storage.upload(file, "portfolio/" + creator.getId());
        var pendingUpload = uploadCleanup.begin(stored);
        String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType().toLowerCase();
        String assetUrl = stored.isCloudinary()
                ? storage.deliveryUrl(stored.legacyUrl(), stored.publicId(), stored.resourceType(), stored.format(), stored.version())
                : stored.legacyUrl();
        var response = PortfolioAssetResponse.from(assets.save(PortfolioAsset.create(creator.getId(), title.trim(), assetUrl, contentType, file.getSize())));
        uploadCleanup.commit(pendingUpload);
        return response;
    }

    @Transactional
    public PortfolioAssetResponse update(String email, Long id, String title, MultipartFile file) {
        User creator = creator(email);
        PortfolioAsset asset = owned(id, creator.getId());
        String normalizedTitle = title == null ? asset.getTitle() : title.trim();
        if (normalizedTitle.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portfolio title is required");
        if (normalizedTitle.length() > 180) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portfolio title is too long");
        if (file == null || file.isEmpty()) {
            asset.update(normalizedTitle, null, null, null);
        } else {
            var stored = storage.upload(file, "portfolio/" + creator.getId());
            var pendingUpload = uploadCleanup.begin(stored);
            String previousAssetUrl = asset.getAssetUrl();
            String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType().toLowerCase();
            String assetUrl = stored.isCloudinary()
                    ? storage.deliveryUrl(stored.legacyUrl(), stored.publicId(), stored.resourceType(), stored.format(), stored.version())
                    : stored.legacyUrl();
            asset.update(normalizedTitle, assetUrl, contentType, file.getSize());
            var response = PortfolioAssetResponse.from(assets.save(asset));
            uploadCleanup.commit(pendingUpload);
            storage.delete(previousAssetUrl);
            return response;
        }
        return PortfolioAssetResponse.from(assets.save(asset));
    }

    @Transactional
    public void delete(String email, Long id) {
        User creator = creator(email);
        PortfolioAsset asset = owned(id, creator.getId());
        storage.delete(asset.getAssetUrl());
        assets.delete(asset);
    }

    private PortfolioAsset owned(Long id, Long creatorId) {
        return assets.findById(id).filter(asset -> asset.getCreatorId().equals(creatorId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio item not found"));
    }

    private User creator(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!"CREATOR".equals(user.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only creators can manage portfolio assets");
        return user;
    }
}
