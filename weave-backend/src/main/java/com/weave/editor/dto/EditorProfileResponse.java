package com.weave.editor.dto;

import com.weave.editor.entity.EditorProfile;
import java.math.BigDecimal;

public record EditorProfileResponse(Long userId, String portfolioLinksJson, BigDecimal rating) {
    public static EditorProfileResponse from(EditorProfile profile) { return new EditorProfileResponse(profile.getUserId(), profile.getPortfolioLinksJson(), profile.getRating()); }
}
