package com.weave.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record MfaCodeRequest(@NotBlank String code) { }
