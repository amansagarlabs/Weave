package com.weave.editor.dto;

import com.weave.editor.entity.EditRequest;

public record EditRequestResponse(Long id, Long creatorId, Long editorId, String status, Integer revisionCount, String paymentStatus, String previewAssetUrl, String finalAssetUrl, Boolean suspensionFlag) {
    public static EditRequestResponse from(EditRequest request) { return new EditRequestResponse(request.getId(), request.getCreatorId(), request.getEditorId(), request.getStatus(), request.getRevisionCount(), request.getPaymentStatus(), request.getPreviewAssetUrl(), request.getFinalAssetUrl(), request.getSuspensionFlag()); }
}
