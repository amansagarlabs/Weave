package com.weave.invoice.controller;

import com.weave.invoice.entity.PaymentWebhookReceipt;
import com.weave.invoice.repository.PaymentWebhookReceiptRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/operations/webhooks")
@PreAuthorize("hasRole('ADMIN')")
public class PaymentWebhookOperationsController {
    private final PaymentWebhookReceiptRepository receipts;

    public PaymentWebhookOperationsController(PaymentWebhookReceiptRepository receipts) { this.receipts = receipts; }

    @GetMapping
    List<WebhookSummary> list() {
        return receipts.findTop100ByOrderByReceivedAtDesc().stream().map(WebhookSummary::from).toList();
    }
}

record WebhookSummary(UUID id, String providerEventId, String eventType, Long invoiceId, String status,
                      int attempts, String lastError, Instant receivedAt, Instant processedAt) {
    static WebhookSummary from(PaymentWebhookReceipt receipt) {
        return new WebhookSummary(receipt.getId(), receipt.getProviderEventId(), receipt.getEventType(), receipt.getInvoiceId(),
                receipt.getStatus(), receipt.getAttempts(), receipt.getLastError(), receipt.getReceivedAt(), receipt.getProcessedAt());
    }
}
