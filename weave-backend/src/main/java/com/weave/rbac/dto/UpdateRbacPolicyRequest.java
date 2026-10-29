package com.weave.rbac.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateRbacPolicyRequest(@NotNull Boolean allowed) { }
