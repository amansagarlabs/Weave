package com.weave.editor.dto;

import jakarta.validation.constraints.NotNull;

public record CreateEditRequest(@NotNull Long editorId) { }
