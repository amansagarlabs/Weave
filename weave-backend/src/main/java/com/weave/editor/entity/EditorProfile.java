package com.weave.editor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "editor_profiles")
public class EditorProfile {
    @Id private Long userId;
    @Column(columnDefinition = "jsonb") private String portfolioLinksJson;
    private java.math.BigDecimal rating;
    protected EditorProfile() { }
}
