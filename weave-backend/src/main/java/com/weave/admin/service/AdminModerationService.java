package com.weave.admin.service;

import com.weave.admin.dto.AdminContentPayload;
import com.weave.admin.dto.AdminContentResponse;
import com.weave.admin.dto.AdminModerationItem;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.editor.entity.EditRequest;
import com.weave.editor.repository.EditRequestRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class AdminModerationService {
    private static final List<String> TAXONOMY = List.of("All", "Tech", "Fashion", "Lifestyle", "Gaming", "Fitness", "Travel", "Beauty");
    private final AtomicReference<AdminContentPayload> publishedContent = new AtomicReference<>(
            new AdminContentPayload(
                    "Good work finds its people.",
                    "Weave brings creators, brands, and editors into one place so the right brief, the right talent, and the next good collaboration can meet.",
                    "Screenshots and screen recordings cannot be technically prevented. Weave uses watermarking and best-effort detection instead."
            )
    );
    private final AtomicReference<AdminContentPayload> draftContent = new AtomicReference<>(publishedContent.get());
    private final UserRepository users;
    private final EditRequestRepository editRequests;

    public AdminModerationService(UserRepository users, EditRequestRepository editRequests) {
        this.users = users;
        this.editRequests = editRequests;
    }

    public List<String> taxonomy() {
        return TAXONOMY;
    }

    public AdminContentResponse content() {
        return new AdminContentResponse(publishedContent.get(), draftContent.get(), TAXONOMY);
    }

    public AdminContentResponse updateContent(AdminContentPayload payload) {
        draftContent.set(payload);
        publishedContent.set(payload);
        return content();
    }

    public List<AdminModerationItem> disputes() {
        List<AdminModerationItem> items = new ArrayList<>();
        for (EditRequest request : editRequests.findAll()) {
            if (Boolean.TRUE.equals(request.getSuspensionFlag()) || "REJECTED".equalsIgnoreCase(request.getStatus()) || "REVISION_REQUESTED".equalsIgnoreCase(request.getStatus())) {
                items.add(new AdminModerationItem(
                        request.getId(),
                        "EDIT_REQUEST",
                        "Edit request #" + request.getId(),
                        Boolean.TRUE.equals(request.getSuspensionFlag()) ? "FLAGGED" : request.getStatus(),
                        "Creator " + request.getCreatorId() + " | Editor " + request.getEditorId()
                ));
            }
        }
        return items;
    }

    public List<AdminModerationItem> flags() {
        List<AdminModerationItem> items = new ArrayList<>();
        for (User user : users.findAll()) {
            if (user.isSuspended()) {
                items.add(new AdminModerationItem(
                        user.getId(),
                        "USER",
                        user.getEmail(),
                        "SUSPENDED",
                        "Role: " + user.getRole().name().toLowerCase()
                ));
            }
        }
        for (EditRequest request : editRequests.findAll()) {
            if (Boolean.TRUE.equals(request.getSuspensionFlag())) {
                items.add(new AdminModerationItem(
                        request.getId(),
                        "EDIT_REQUEST",
                        "Edit request #" + request.getId(),
                        "FLAGGED",
                        "pending founder sign-off"
                ));
            }
        }
        return items;
    }
}
