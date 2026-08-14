package com.weave.invoice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
import org.springframework.web.server.ResponseStatusException;

class RazorpayWebhookServiceTest {
    @Test
    void verifiesSignatureAndMarksInvoicePaid() throws Exception {
        InvoiceService invoices = mock(InvoiceService.class); String payload = "{\"event\":\"payment.captured\",\"invoiceId\":42}"; String signature = sign(payload, "demo-secret");
        new RazorpayWebhookService(new ObjectMapper(), invoices, "demo-secret").handle(payload, signature);
        verify(invoices).markPaidFromWebhook(42L);
    }

    @Test
    void rejectsInvalidSignature() {
        InvoiceService invoices = mock(InvoiceService.class); RazorpayWebhookService service = new RazorpayWebhookService(new ObjectMapper(), invoices, "demo-secret");
        assertThrows(ResponseStatusException.class, () -> service.handle("{\"event\":\"payment.captured\",\"invoiceId\":42}", "bad")); verifyNoInteractions(invoices);
    }

    private String sign(String payload, String secret) throws Exception { Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256")); StringBuilder result = new StringBuilder(); for (byte value : mac.doFinal(payload.getBytes(StandardCharsets.UTF_8))) result.append(String.format("%02x", value)); return result.toString(); }
}
