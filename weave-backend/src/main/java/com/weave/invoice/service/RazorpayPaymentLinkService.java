package com.weave.invoice.service;

import com.weave.invoice.entity.Invoice;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RazorpayPaymentLinkService implements PaymentLinkService {
    @Override
    public String createPaymentLink(Invoice invoice) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Razorpay payment links are not configured yet");
    }
}
