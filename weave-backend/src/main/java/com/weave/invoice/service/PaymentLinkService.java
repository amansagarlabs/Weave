package com.weave.invoice.service;

import com.weave.invoice.entity.Invoice;

public interface PaymentLinkService {
    String createPaymentLink(Invoice invoice);
}
