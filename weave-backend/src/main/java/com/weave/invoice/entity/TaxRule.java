package com.weave.invoice.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tax_rules")
public class TaxRule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String code;
    @Column(nullable = false, precision = 8, scale = 4) private BigDecimal rate;
    @Column(nullable = false) private boolean active = true;
    protected TaxRule() { }
    public BigDecimal getRate() { return rate; }
}
