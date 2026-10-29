package com.weave.brand.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "brand_profiles")
public class BrandProfile {
    @Id private Long userId;
    @Column(nullable = false) private String companyName;
    private String industry;
    private String gstin;
    protected BrandProfile() { }

    public static BrandProfile create(Long userId, String companyName, String industry, String gstin) {
        BrandProfile profile = new BrandProfile();
        profile.userId = userId;
        profile.companyName = companyName;
        profile.industry = industry;
        profile.gstin = gstin;
        return profile;
    }

    public void update(String companyName, String industry, String gstin) { this.companyName = companyName; this.industry = industry; this.gstin = gstin; }
    public Long getUserId() { return userId; }
    public String getCompanyName() { return companyName; }
    public String getIndustry() { return industry; }
    public String getGstin() { return gstin; }
}
