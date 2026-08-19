package com.weave.invoice.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_webhook_receipts")
public class PaymentWebhookReceipt {
    @Id
    private UUID id;
    @Column(nullable = false, unique = true, length = 180)
    private String providerEventId;
    @Column(nullable = false, length = 120)
    private String eventType;
    private Long invoiceId;
    @Column(nullable = false, length = 64)
    private String payloadHash;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(nullable = false)
    private int attempts;
    @Column(length = 2000)
    private String lastError;
    @Column(nullable = false, updatable = false)
    private Instant receivedAt = Instant.now();
    private Instant processedAt;

    protected PaymentWebhookReceipt() { }

    public static PaymentWebhookReceipt receive(String eventId, String eventType, Long invoiceId, String payloadHash) {
        PaymentWebhookReceipt receipt = new PaymentWebhookReceipt();
        receipt.id = UUID.randomUUID();
        receipt.providerEventId = eventId;
        receipt.eventType = eventType;
        receipt.invoiceId = invoiceId;
        receipt.payloadHash = payloadHash;
        receipt.status = "PROCESSING";
        receipt.attempts = 1;
        return receipt;
    }

    public UUID getId() { return id; }
    public String getProviderEventId() { return providerEventId; }
    public String getEventType() { return eventType; }
    public Long getInvoiceId() { return invoiceId; }
    public String getPayloadHash() { return payloadHash; }
    public String getStatus() { return status; }
    public int getAttempts() { return attempts; }
    public String getLastError() { return lastError; }
    public Instant getReceivedAt() { return receivedAt; }
    public Instant getProcessedAt() { return processedAt; }

    public boolean isProcessed() { return "PROCESSED".equals(status); }
    public void markProcessed() { status = "PROCESSED"; processedAt = Instant.now(); lastError = null; }
    public void markFailed(String error) {
        status = "FAILED";
        attempts++;
        lastError = error == null ? "Unknown webhook processing error" : error.substring(0, Math.min(2000, error.length()));
    }
    public void retry() { status = "PROCESSING"; attempts++; lastError = null; }
}
