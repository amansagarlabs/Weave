package com.weave.admin.controller;

import com.weave.admin.dto.AdminContentPayload;
import com.weave.admin.dto.AdminContentResponse;
import com.weave.admin.dto.AdminModerationItem;
import com.weave.admin.service.AdminModerationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminModerationController {
    private final AdminModerationService moderation;

    public AdminModerationController(AdminModerationService moderation) {
        this.moderation = moderation;
    }

    @GetMapping("/taxonomy")
    public List<String> taxonomy() {
        return moderation.taxonomy();
    }

    @GetMapping("/content")
    public AdminContentResponse content() {
        return moderation.content();
    }

    @PatchMapping("/content")
    public AdminContentResponse updateContent(@RequestBody AdminContentPayload payload) {
        return moderation.updateContent(payload);
    }

    @GetMapping("/disputes")
    public List<AdminModerationItem> disputes() {
        return moderation.disputes();
    }

    @GetMapping("/flags")
    public List<AdminModerationItem> flags() {
        return moderation.flags();
    }
}
