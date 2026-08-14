package com.weave.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserSettingsRequest(
        @NotBlank String locale,
        @NotBlank String notificationPreference
) { }
