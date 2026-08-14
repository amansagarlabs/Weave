package com.weave.invoice.controller;

import com.weave.invoice.dto.InvoiceResponse;
import com.weave.invoice.service.RazorpayWebhookService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks/razorpay")
public class RazorpayWebhookController {
    private final RazorpayWebhookService webhooks;
    public RazorpayWebhookController(RazorpayWebhookService webhooks) { this.webhooks = webhooks; }
    @PostMapping InvoiceResponse receive(@RequestHeader(value = "X-Razorpay-Signature", required = false) String signature, @RequestBody String payload) { return webhooks.handle(payload, signature); }
}
