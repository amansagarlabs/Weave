package com.weave.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record MfaChallengeRequest(@NotBlank String token, @NotBlank String code) { }
