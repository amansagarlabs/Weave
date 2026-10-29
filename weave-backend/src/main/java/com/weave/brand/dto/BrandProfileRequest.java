package com.weave.brand.dto;

import jakarta.validation.constraints.NotBlank;

public record BrandProfileRequest(@NotBlank String companyName, String industry, String gstin) { }
