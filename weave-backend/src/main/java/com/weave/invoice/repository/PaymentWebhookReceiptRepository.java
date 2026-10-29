package com.weave.invoice.repository;

import com.weave.invoice.entity.PaymentWebhookReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentWebhookReceiptRepository extends JpaRepository<PaymentWebhookReceipt, UUID> {
    Optional<PaymentWebhookReceipt> findByProviderEventId(String providerEventId);
    List<PaymentWebhookReceipt> findTop100ByOrderByReceivedAtDesc();
}
