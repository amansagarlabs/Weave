package com.weave.editor.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.editor.dto.CreateEditRequest;
import com.weave.editor.dto.EditRequestResponse;
import com.weave.editor.entity.EditRequest;
import com.weave.editor.repository.EditRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Set;
import com.weave.notification.service.NotificationService;
import com.weave.storage.S3StorageService;
import com.weave.storage.StorageUploadCleanupJob;
import org.springframework.web.multipart.MultipartFile;

@Service
public class EditRequestService {
    private final EditRequestRepository requests;
    private final UserRepository users;
    private final NotificationService notifications;
    private final S3StorageService storage;
    private final StorageUploadCleanupJob uploadCleanup;
    public EditRequestService(EditRequestRepository requests, UserRepository users, NotificationService notifications, S3StorageService storage, StorageUploadCleanupJob uploadCleanup) { this.requests = requests; this.users = users; this.notifications = notifications; this.storage = storage; this.uploadCleanup = uploadCleanup; }

    public EditRequestResponse create(String email, CreateEditRequest input) { User creator = user(email, "CREATOR"); User editor = users.findById(input.editorId()).filter(item -> "EDITOR".equals(item.getRole().name())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Editor not found")); EditRequest saved = requests.save(EditRequest.create(creator.getId(), editor.getId())); notifications.create(editor.getId(), "New editing request", "A creator sent you an editing request. Review the brief and respond when ready.", "EDITOR_REQUEST"); return response(saved); }
    public List<EditRequestResponse> creatorMine(String email) { User creator = user(email, "CREATOR"); return requests.findByCreatorIdOrderByIdDesc(creator.getId()).stream().map(this::response).toList(); }
    public List<EditRequestResponse> editorMine(String email) { User editor = user(email, "EDITOR"); return requests.findByEditorIdOrderByIdDesc(editor.getId()).stream().map(this::response).toList(); }
    public EditRequestResponse byId(String email, Long id) { User actor = user(email, null); return response(owned(id, actor.getId())); }

    public EditRequestResponse status(String email, Long id, String value) { User actor = user(email, null); EditRequest request = owned(id, actor.getId()); String next = value.trim().toUpperCase().replace(' ', '_'); if ("EDITOR".equals(actor.getRole().name()) && !Set.of("ACCEPTED", "PREVIEW_DELIVERED").contains(next)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Editors can accept requests or deliver previews"); if ("CREATOR".equals(actor.getRole().name()) && !Set.of("COMPLETE").contains(next)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Creators can mark an editor request complete after review"); request.moveTo(next); return response(requests.save(request)); }
    public EditRequestResponse revision(String email, Long id) { User creator = user(email, "CREATOR"); EditRequest request = owned(id, creator.getId()); try { request.requestRevision(); } catch (IllegalStateException exception) { throw new ResponseStatusException(HttpStatus.CONFLICT, "Maximum of 3 revisions reached"); } return response(requests.save(request)); }
    public EditRequestResponse uploadAsset(String email, Long id, String kind, MultipartFile file) { User actor = user(email, null); EditRequest request = owned(id, actor.getId()); String normalized = kind.trim().toLowerCase(); if (!Set.of("preview", "final").contains(normalized)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset kind must be preview or final"); var storedAsset = storage.upload(file, "edit-requests/" + id + "/" + normalized); var pendingUpload = uploadCleanup.begin(storedAsset); if ("preview".equals(normalized)) request.attachPreview(storedAsset); else request.attachFinal(storedAsset); var saved = requests.save(request); uploadCleanup.commit(pendingUpload); return response(saved); }

    private EditRequestResponse response(EditRequest request) { return new EditRequestResponse(request.getId(), request.getCreatorId(), request.getEditorId(), request.getStatus(), request.getRevisionCount(), request.getPaymentStatus(), storage.deliveryUrl(request.getPreviewAssetUrl(), request.getPreviewAssetPublicId(), request.getPreviewAssetResourceType(), request.getPreviewAssetFormat(), request.getPreviewAssetVersion()), storage.deliveryUrl(request.getFinalAssetUrl(), request.getFinalAssetPublicId(), request.getFinalAssetResourceType(), request.getFinalAssetFormat(), request.getFinalAssetVersion()), request.getSuspensionFlag()); }

    private EditRequest owned(Long id, Long userId) { return requests.findById(id).filter(item -> item.getCreatorId().equals(userId) || item.getEditorId().equals(userId)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Edit request not found")); }
    private User user(String email, String expectedRole) { User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); if (expectedRole != null && !expectedRole.equals(user.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account cannot perform this action"); return user; }
}
