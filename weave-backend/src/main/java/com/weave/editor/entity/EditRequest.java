package com.weave.editor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "edit_requests")
public class EditRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long creatorId;
    private Long editorId;
    private String status;
    private Integer revisionCount = 0;
    private String paymentStatus;
    private String previewAssetUrl;
    private String finalAssetUrl;
    // Placeholder only; suspension trigger is pending founder sign-off.
    private Boolean suspensionFlag = false;
    protected EditRequest() { }

    public static EditRequest create(Long creatorId, Long editorId) { EditRequest request = new EditRequest(); request.creatorId = creatorId; request.editorId = editorId; request.status = "PENDING"; request.revisionCount = 0; request.paymentStatus = "PENDING"; request.suspensionFlag = false; return request; }
    public void moveTo(String nextStatus) { this.status = nextStatus; }
    public void requestRevision() { if (revisionCount >= 3) throw new IllegalStateException("Revision limit reached"); revisionCount++; status = "REVISION_REQUESTED"; }
    public Long getId() { return id; }
    public Long getCreatorId() { return creatorId; }
    public Long getEditorId() { return editorId; }
    public String getStatus() { return status; }
    public Integer getRevisionCount() { return revisionCount; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getPreviewAssetUrl() { return previewAssetUrl; }
    public String getFinalAssetUrl() { return finalAssetUrl; }
    public Boolean getSuspensionFlag() { return suspensionFlag; }
}
