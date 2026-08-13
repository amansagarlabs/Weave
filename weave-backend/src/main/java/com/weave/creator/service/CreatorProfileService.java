package com.weave.creator.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.creator.dto.CreatorProfileRequest;
import com.weave.creator.dto.CreatorProfileResponse;
import com.weave.creator.entity.CreatorProfile;
import com.weave.creator.repository.CreatorProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CreatorProfileService {
    public static final List<String> CATEGORIES = List.of("All", "Tech", "Fashion", "Lifestyle", "Gaming", "Fitness", "Travel", "Beauty");

    private final CreatorProfileRepository profiles;
    private final UserRepository users;

    public CreatorProfileService(CreatorProfileRepository profiles, UserRepository users) {
        this.profiles = profiles;
        this.users = users;
    }

    public CreatorProfileResponse save(String email, CreatorProfileRequest request) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!user.getRole().name().equals("CREATOR")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only creator accounts can edit creator profiles");
        }
        String slug = request.publicSlug().trim().toLowerCase().replaceAll("[^a-z0-9-]", "-");
        CreatorProfile profile = CreatorProfile.create(user.getId(), request.displayName().trim(), slug, request.categoriesJson(), request.platformsJson(), request.city(), request.contentLanguage(), request.availabilityStatus());
        return CreatorProfileResponse.from(profiles.save(profile));
    }

    public CreatorProfileResponse byId(Long id) {
        return profiles.findById(id).map(CreatorProfileResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator profile not found"));
    }

    public CreatorProfileResponse bySlug(String slug) {
        return profiles.findByPublicSlug(slug).map(CreatorProfileResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator profile not found"));
    }

    public List<CreatorProfileResponse> discover(String category) {
        return profiles.findAll().stream()
                .filter(profile -> category == null || category.isBlank() || "All".equalsIgnoreCase(category) || (profile.getCategoriesJson() != null && profile.getCategoriesJson().toLowerCase().contains(category.toLowerCase())))
                .map(CreatorProfileResponse::from).toList();
    }
}
