package com.weave.organization.dto;

import java.time.Instant;

public record AdminOrganizationResponse(Long id, String name, String slug, boolean personal, boolean disabled, Long createdBy, long memberCount, Instant createdAt) { }
