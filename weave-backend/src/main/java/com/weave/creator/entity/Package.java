package com.weave.creator.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "packages")
public class Package {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long ownerId;
    private Long organizationId;
    @Column(nullable = false) private String ownerType;
    @Column(nullable = false) private String contentType;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal price;
    private Integer deliveryDays;
    private Integer revisionsIncluded;
    @Column(nullable = false) private boolean active = true;
    protected Package() { }

    public static Package create(Long ownerId, String contentType, BigDecimal price, Integer deliveryDays, Integer revisionsIncluded) {
        return create(ownerId, "CREATOR", contentType, price, deliveryDays, revisionsIncluded);
    }

    public static Package create(Long ownerId, String ownerType, String contentType, BigDecimal price, Integer deliveryDays, Integer revisionsIncluded) {
        return create(ownerId, null, ownerType, contentType, price, deliveryDays, revisionsIncluded);
    }

    public static Package create(Long ownerId, Long organizationId, String ownerType, String contentType, BigDecimal price, Integer deliveryDays, Integer revisionsIncluded) {
        Package item = new Package();
        item.ownerId = ownerId;
        item.organizationId = organizationId;
        item.ownerType = ownerType;
        item.contentType = contentType;
        item.price = price;
        item.deliveryDays = deliveryDays;
        item.revisionsIncluded = revisionsIncluded;
        item.active = true;
        return item;
    }

    public void update(String contentType, BigDecimal price, Integer deliveryDays, Integer revisionsIncluded) {
        this.contentType = contentType;
        this.price = price;
        this.deliveryDays = deliveryDays;
        this.revisionsIncluded = revisionsIncluded;
    }

    public void archive() { this.active = false; }
    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public Long getOrganizationId() { return organizationId; }
    public String getOwnerType() { return ownerType; }
    public String getContentType() { return contentType; }
    public BigDecimal getPrice() { return price; }
    public Integer getDeliveryDays() { return deliveryDays; }
    public Integer getRevisionsIncluded() { return revisionsIncluded; }
    public boolean isActive() { return active; }
}
