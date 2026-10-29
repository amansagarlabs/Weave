package com.weave.editor.dto;

import com.weave.creator.dto.PackageResponse;
import com.weave.editor.entity.EditorProfile;
import java.util.List;

public record EditorDiscoveryResponse(Long editorId, String portfolioLinksJson, List<PackageResponse> gigs) {
    public static EditorDiscoveryResponse from(EditorProfile profile, List<PackageResponse> gigs) {
        return new EditorDiscoveryResponse(profile.getUserId(), profile.getPortfolioLinksJson(), gigs);
    }
}
