package com.weave.creator.dto;

import jakarta.validation.constraints.NotBlank;

public record CreatorProfileRequest(
        @NotBlank String displayName,
        @NotBlank String publicSlug,
        String categoriesJson,
        String platformsJson,
        String city,
        String contentLanguage,
        String availabilityStatus
) { }
