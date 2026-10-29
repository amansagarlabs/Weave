package com.weave.editor.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "editor_profiles")
public class EditorProfile {
    @Id private Long userId;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb") private String portfolioLinksJson;
    private java.math.BigDecimal rating;
    protected EditorProfile() { }

    public static EditorProfile create(Long userId, String portfolioLinksJson) { EditorProfile profile = new EditorProfile(); profile.userId = userId; profile.portfolioLinksJson = portfolioLinksJson; return profile; }
    public void update(String portfolioLinksJson) { this.portfolioLinksJson = portfolioLinksJson; }
    public Long getUserId() { return userId; }
    public String getPortfolioLinksJson() { return portfolioLinksJson; }
    public java.math.BigDecimal getRating() { return rating; }
}
