package com.weave.invoice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.weave.invoice.dto.InvoiceResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class RazorpayWebhookService {
    private final ObjectMapper mapper;
    private final InvoiceService invoices;
    private final String secret;

    public RazorpayWebhookService(ObjectMapper mapper, InvoiceService invoices, @Value("${weave.payments.razorpay.webhook-secret:}") String secret) { this.mapper = mapper; this.invoices = invoices; this.secret = secret; }

    public InvoiceResponse handle(String payload, String signature) {
        if (secret == null || secret.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Razorpay webhook secret is not configured");
        if (signature == null || signature.isBlank() || !valid(payload, signature)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Razorpay webhook signature");
        try {
            JsonNode root = mapper.readTree(payload);
            String event = root.path("event").asText("");
            if (!"payment_link.paid".equals(event) && !"payment.captured".equals(event)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported Razorpay webhook event");
            long invoiceId = root.path("invoiceId").asLong(0);
            if (invoiceId == 0) invoiceId = root.path("payload").path("payment_link").path("entity").path("notes").path("invoice_id").asLong(0);
            if (invoiceId == 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Razorpay webhook has no invoice id");
            return invoices.markPaidFromWebhook(invoiceId);
        } catch (ResponseStatusException exception) { throw exception; } catch (Exception exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Razorpay webhook payload"); }
    }

    private boolean valid(String payload, String provided) { try { Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256")); byte[] expected = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)); byte[] actual = hex(provided); return actual != null && MessageDigest.isEqual(expected, actual); } catch (Exception exception) { return false; } }
    private byte[] hex(String value) { if (value.length() % 2 != 0) return null; byte[] result = new byte[value.length() / 2]; try { for (int i = 0; i < result.length; i++) result[i] = (byte) Integer.parseInt(value.substring(i * 2, i * 2 + 2), 16); return result; } catch (NumberFormatException exception) { return null; } }
}
