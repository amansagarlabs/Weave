package com.weave.creator.dto;

import com.weave.creator.entity.CreatorProfile;

public record CreatorProfileResponse(
        Long userId,
        String displayName,
        String publicSlug,
        String categoriesJson,
        String platformsJson,
        String city,
        String contentLanguage,
        String availabilityStatus,
        Integer influencingScore
) {
    public static CreatorProfileResponse from(CreatorProfile profile) {
        return new CreatorProfileResponse(profile.getUserId(), profile.getDisplayName(), profile.getPublicSlug(), profile.getCategoriesJson(), profile.getPlatformsJson(), profile.getCity(), profile.getContentLanguage(), profile.getAvailabilityStatus(), profile.getInfluencingScore());
    }
}
