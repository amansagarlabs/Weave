package com.weave.editor.entity;

import com.weave.storage.StoredAsset;
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
    private String previewAssetPublicId;
    private String previewAssetResourceType;
    private String previewAssetFormat;
    private Long previewAssetVersion;
    private String finalAssetPublicId;
    private String finalAssetResourceType;
    private String finalAssetFormat;
    private Long finalAssetVersion;
    // Placeholder only; suspension trigger is pending founder sign-off.
    private Boolean suspensionFlag = false;
    protected EditRequest() { }

    public static EditRequest create(Long creatorId, Long editorId) { EditRequest request = new EditRequest(); request.creatorId = creatorId; request.editorId = editorId; request.status = "PENDING"; request.revisionCount = 0; request.paymentStatus = "PENDING"; request.suspensionFlag = false; return request; }
    public void moveTo(String nextStatus) { this.status = nextStatus; }
    public void attachPreview(StoredAsset asset) { this.previewAssetUrl = asset.legacyUrl(); this.previewAssetPublicId = asset.publicId(); this.previewAssetResourceType = asset.resourceType(); this.previewAssetFormat = asset.format(); this.previewAssetVersion = asset.version(); }
    public void attachFinal(StoredAsset asset) { this.finalAssetUrl = asset.legacyUrl(); this.finalAssetPublicId = asset.publicId(); this.finalAssetResourceType = asset.resourceType(); this.finalAssetFormat = asset.format(); this.finalAssetVersion = asset.version(); }
    public void requestRevision() { if (revisionCount >= 3) throw new IllegalStateException("Revision limit reached"); revisionCount++; status = "REVISION_REQUESTED"; }
    public Long getId() { return id; }
    public Long getCreatorId() { return creatorId; }
    public Long getEditorId() { return editorId; }
    public String getStatus() { return status; }
    public Integer getRevisionCount() { return revisionCount; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getPreviewAssetUrl() { return previewAssetUrl; }
    public String getFinalAssetUrl() { return finalAssetUrl; }
    public String getPreviewAssetPublicId() { return previewAssetPublicId; }
    public String getPreviewAssetResourceType() { return previewAssetResourceType; }
    public String getPreviewAssetFormat() { return previewAssetFormat; }
    public Long getPreviewAssetVersion() { return previewAssetVersion; }
    public String getFinalAssetPublicId() { return finalAssetPublicId; }
    public String getFinalAssetResourceType() { return finalAssetResourceType; }
    public String getFinalAssetFormat() { return finalAssetFormat; }
    public Long getFinalAssetVersion() { return finalAssetVersion; }
    public Boolean getSuspensionFlag() { return suspensionFlag; }
}
