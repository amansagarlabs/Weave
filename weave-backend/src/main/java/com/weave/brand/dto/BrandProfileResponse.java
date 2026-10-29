package com.weave.brand.dto;

import com.weave.brand.entity.BrandProfile;

public record BrandProfileResponse(Long userId, String companyName, String industry, String gstin) {
    public static BrandProfileResponse from(BrandProfile profile) { return new BrandProfileResponse(profile.getUserId(), profile.getCompanyName(), profile.getIndustry(), profile.getGstin()); }
}
