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
}
