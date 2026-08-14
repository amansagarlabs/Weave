package com.weave.creator.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "creator_profiles")
public class CreatorProfile {
    @Id private Long userId;
    @Column(nullable = false) private String displayName;
    @Column(nullable = false, unique = true) private String publicSlug;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb") private String categoriesJson;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb") private String platformsJson;
    private String city;
    private String contentLanguage;
    private String availabilityStatus;
    // Placeholder only; influencing_score formula is pending founder sign-off.
    private Integer influencingScore;
    protected CreatorProfile() { }

    public static CreatorProfile create(Long userId, String displayName, String publicSlug, String categoriesJson, String platformsJson, String city, String contentLanguage, String availabilityStatus) {
        CreatorProfile profile = new CreatorProfile();
        profile.userId = userId;
        profile.displayName = displayName;
        profile.publicSlug = publicSlug;
        profile.categoriesJson = categoriesJson;
        profile.platformsJson = platformsJson;
        profile.city = city;
        profile.contentLanguage = contentLanguage;
        profile.availabilityStatus = availabilityStatus;
        return profile;
    }

    public void update(String displayName, String publicSlug, String categoriesJson, String platformsJson, String city, String contentLanguage, String availabilityStatus) {
        this.displayName = displayName;
        this.publicSlug = publicSlug;
        this.categoriesJson = categoriesJson;
        this.platformsJson = platformsJson;
        this.city = city;
        this.contentLanguage = contentLanguage;
        this.availabilityStatus = availabilityStatus;
    }

    public Long getUserId() { return userId; }
    public String getDisplayName() { return displayName; }
    public String getPublicSlug() { return publicSlug; }
    public String getCategoriesJson() { return categoriesJson; }
    public String getPlatformsJson() { return platformsJson; }
    public String getCity() { return city; }
    public String getContentLanguage() { return contentLanguage; }
    public String getAvailabilityStatus() { return availabilityStatus; }
    public Integer getInfluencingScore() { return influencingScore; }
}
