package com.weave.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record MagicLinkVerifyRequest(@NotBlank String token) { }
