package com.weave.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMessageRequest(@NotBlank String threadId, @NotNull Long recipientId, @NotBlank String body) { }
