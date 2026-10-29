package com.weave.editor.dto;

import jakarta.validation.constraints.NotBlank;

public record EditRequestStatus(@NotBlank String status) { }
