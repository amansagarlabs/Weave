package com.weave.creator.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.creator.dto.CreatorProfileRequest;
import com.weave.creator.dto.CreatorProfileResponse;
import com.weave.creator.entity.CreatorProfile;
import com.weave.creator.repository.CreatorProfileRepository;
import com.weave.creator.repository.PackageRepository;
import com.weave.creator.dto.PackageResponse;
import com.weave.storage.S3StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CreatorProfileService {
    public static final List<String> CATEGORIES = List.of("All", "Tech", "Fashion", "Lifestyle", "Gaming", "Fitness", "Travel", "Beauty");

    private final CreatorProfileRepository profiles;
    private final UserRepository users;
    private final PackageRepository packages;
    private final S3StorageService storage;

    public CreatorProfileService(CreatorProfileRepository profiles, UserRepository users, PackageRepository packages, S3StorageService storage) {
        this.profiles = profiles; this.users = users; this.packages = packages; this.storage = storage;
    }

    public CreatorProfileResponse save(String email, CreatorProfileRequest request) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!user.getRole().name().equals("CREATOR")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only creator accounts can edit creator profiles");
        }
        String slug = request.publicSlug().trim().toLowerCase().replaceAll("[^a-z0-9-]", "-");
        profiles.findByPublicSlug(slug).filter(existing -> !existing.getUserId().equals(user.getId())).ifPresent(existing -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "publicSlug: This public slug is already in use"); });
        CreatorProfile profile = profiles.findById(user.getId()).orElseGet(() -> CreatorProfile.create(user.getId(), request.displayName().trim(), slug, request.categoriesJson(), request.platformsJson(), request.city(), request.contentLanguage(), request.availabilityStatus(), request.bio()));
        profile.update(request.displayName().trim(), slug, request.categoriesJson(), request.platformsJson(), request.city(), request.contentLanguage(), request.availabilityStatus(), request.bio());
        return CreatorProfileResponse.from(profiles.save(profile));
    }

    public CreatorProfileResponse mine(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!"CREATOR".equals(user.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only creator accounts have creator profiles");
        return profiles.findById(user.getId()).map(CreatorProfileResponse::from).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator profile not found"));
    }

    public CreatorProfileResponse byId(Long id) {
        return profiles.findById(id).map(CreatorProfileResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator profile not found"));
    }

    public CreatorProfileResponse bySlug(String slug) {
        return profiles.findByPublicSlugIgnoreCase(slug.trim()).map(CreatorProfileResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator profile not found"));
    }

    public List<PackageResponse> publicPackages(String slug) {
        CreatorProfile profile = profiles.findByPublicSlugIgnoreCase(slug.trim()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator profile not found"));
        return packages.findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(profile.getUserId(), "CREATOR").stream().map(PackageResponse::from).toList();
    }

    public List<CreatorProfileResponse> discover(String category) {
        return profiles.findAll().stream()
                .filter(profile -> category == null || category.isBlank() || "All".equalsIgnoreCase(category) || (profile.getCategoriesJson() != null && profile.getCategoriesJson().toLowerCase().contains(category.toLowerCase())))
                .map(CreatorProfileResponse::from).toList();
    }

    public CreatorProfileResponse uploadAvatar(String email, MultipartFile file) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!"CREATOR".equals(user.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only creator accounts have creator profiles");
        CreatorProfile profile = profiles.findById(user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator profile not found"));
        var stored = storage.upload(file, "avatars/" + user.getId());
        String url = storage.deliveryUrl(stored.legacyUrl(), stored.publicId(), stored.resourceType(), stored.format(), stored.version());
        profile.setAvatarUrl(url);
        return CreatorProfileResponse.from(profiles.save(profile));
    }
}
