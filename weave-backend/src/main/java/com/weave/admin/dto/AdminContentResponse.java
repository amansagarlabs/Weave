package com.weave.admin.dto;

import java.util.List;

public record AdminContentResponse(AdminContentPayload published, AdminContentPayload draft, List<String> taxonomy) { }
