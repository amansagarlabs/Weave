package com.weave.creator.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "packages")
public class Package {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long ownerId;
    @Column(nullable = false) private String ownerType;
    @Column(nullable = false) private String contentType;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal price;
    private Integer deliveryDays;
    private Integer revisionsIncluded;
    protected Package() { }
}
