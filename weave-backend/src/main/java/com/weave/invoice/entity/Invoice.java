package com.weave.invoice.entity;

import com.weave.invoice.service.TaxCalculationService;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "invoices")
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long bookingId;
    @Column(nullable = false) private Long creatorId;
    @Column(nullable = false) private Long brandId;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Column(nullable = false) private String status = "DRAFT";
    @Column(columnDefinition = "TEXT") private String paymentLink;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    private Instant dueAt;
    private Instant paidAt;
    private String creatorGstin;
    private String brandGstin;
    private String sacCode;
    private String placeOfSupply;
    @Column(nullable = false, precision = 8, scale = 4) private BigDecimal gstRate = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal gstAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 8, scale = 4) private BigDecimal tdsRate = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal tdsAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal netPayable = BigDecimal.ZERO;

    protected Invoice() { }
    public static Invoice draft(Long bookingId, Long creatorId, Long brandId, BigDecimal amount, Instant dueAt, String creatorGstin, String brandGstin, String sacCode, String placeOfSupply, BigDecimal gstRate, BigDecimal gstAmount, BigDecimal tdsRate, BigDecimal tdsAmount, BigDecimal netPayable) {
        Invoice invoice = new Invoice(); invoice.bookingId = bookingId; invoice.creatorId = creatorId; invoice.brandId = brandId; invoice.amount = amount; invoice.dueAt = dueAt; invoice.creatorGstin = creatorGstin; invoice.brandGstin = brandGstin; invoice.sacCode = sacCode; invoice.placeOfSupply = placeOfSupply; invoice.gstRate = gstRate; invoice.gstAmount = gstAmount; invoice.tdsRate = tdsRate; invoice.tdsAmount = tdsAmount; invoice.netPayable = netPayable; return invoice;
    }
    public void markSent(String link) { this.paymentLink = link; this.status = "SENT"; }
    public void updateDraft(Instant dueAt, String creatorGstin, String brandGstin, String sacCode, String placeOfSupply, TaxCalculationService.TaxBreakdown tax) {
        this.dueAt = dueAt;
        this.creatorGstin = creatorGstin;
        this.brandGstin = brandGstin;
        this.sacCode = sacCode;
        this.placeOfSupply = placeOfSupply;
        this.gstRate = tax.gstRate();
        this.gstAmount = tax.gstAmount();
        this.tdsRate = tax.tdsRate();
        this.tdsAmount = tax.tdsAmount();
        this.netPayable = tax.netPayable();
    }
    public void markPaid(Instant paidAt) { this.status = "PAID"; this.paidAt = paidAt; }
    public boolean markOverdue(Instant now) { if ("SENT".equals(status) && dueAt != null && dueAt.isBefore(now)) { status = "OVERDUE"; return true; } return false; }
    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public Long getCreatorId() { return creatorId; }
    public Long getBrandId() { return brandId; }
    public BigDecimal getAmount() { return amount; }
    public String getStatus() { return status; }
    public String getPaymentLink() { return paymentLink; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getDueAt() { return dueAt; }
    public Instant getPaidAt() { return paidAt; }
    public String getCreatorGstin() { return creatorGstin; }
    public String getBrandGstin() { return brandGstin; }
    public String getSacCode() { return sacCode; }
    public String getPlaceOfSupply() { return placeOfSupply; }
    public BigDecimal getGstRate() { return gstRate; }
    public BigDecimal getGstAmount() { return gstAmount; }
    public BigDecimal getTdsRate() { return tdsRate; }
    public BigDecimal getTdsAmount() { return tdsAmount; }
    public BigDecimal getNetPayable() { return netPayable; }
}
