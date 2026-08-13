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
}
