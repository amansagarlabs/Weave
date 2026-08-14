package com.weave.booking.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long brandId;
    private Long creatorId;
    private Long packageId;
    @Column(nullable = false) private String status = "PENDING";
    @Column(precision = 12, scale = 2) private BigDecimal amount;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb") private String statusHistoryJson;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    protected Booking() { }

    public static Booking create(Long brandId, Long creatorId, Long packageId, BigDecimal amount) {
        Booking booking = new Booking();
        booking.brandId = brandId;
        booking.creatorId = creatorId;
        booking.packageId = packageId;
        booking.amount = amount;
        booking.status = "PENDING";
        booking.statusHistoryJson = "[{\"status\":\"PENDING\"}]";
        return booking;
    }

    public void moveTo(String nextStatus) {
        this.status = nextStatus;
        String entry = "{\"status\":\"" + nextStatus + "\"}";
        if (statusHistoryJson == null || statusHistoryJson.isBlank() || "[]".equals(statusHistoryJson)) statusHistoryJson = "[" + entry + "]";
        else statusHistoryJson = statusHistoryJson.substring(0, statusHistoryJson.length() - 1) + "," + entry + "]";
    }

    public Long getId() { return id; }
    public Long getBrandId() { return brandId; }
    public Long getCreatorId() { return creatorId; }
    public Long getPackageId() { return packageId; }
    public String getStatus() { return status; }
    public BigDecimal getAmount() { return amount; }
    public Instant getCreatedAt() { return createdAt; }
    public String getStatusHistoryJson() { return statusHistoryJson; }
}
