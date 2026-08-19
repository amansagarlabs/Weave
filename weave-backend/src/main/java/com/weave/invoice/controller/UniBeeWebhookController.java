package com.weave.invoice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.weave.invoice.entity.PaymentWebhookReceipt;
import com.weave.invoice.repository.PaymentWebhookReceiptRepository;
import com.weave.invoice.service.InvoiceService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HexFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/webhooks/unibee")
public class UniBeeWebhookController {
    private static final Pattern INVOICE_REFERENCE = Pattern.compile("weave-invoice-(\\d+)");
    private final ObjectMapper mapper;
    private final InvoiceService invoices;
    private final PaymentWebhookReceiptRepository receipts;
    private final String apiKey;

    public UniBeeWebhookController(ObjectMapper mapper, InvoiceService invoices, PaymentWebhookReceiptRepository receipts,
            @Value("${weave.billing.unibee.api-key:}") String apiKey) {
        this.mapper = mapper;
        this.invoices = invoices;
        this.receipts = receipts;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
    }

    @PostMapping
    public String receive(@RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Signature", required = false) String signature,
            @RequestHeader(value = "X-Signature-Algorithm", required = false) String algorithm,
            @RequestHeader(value = "EventType", required = false) String headerEventType,
            @RequestHeader(value = "EventId", required = false) String headerEventId,
            @RequestBody String payload) {
        if (apiKey.isBlank() || authorization == null || !MessageDigest.isEqual(("Bearer " + apiKey).getBytes(StandardCharsets.UTF_8), authorization.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid UniBee webhook authorization");
        }
        if (!"hmac".equalsIgnoreCase(algorithm) || !validSignature(payload, signature)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid UniBee webhook signature");
        }
        try {
            JsonNode root = mapper.readTree(payload);
            String eventType = firstText(root, "eventType");
            if (eventType.isBlank()) eventType = headerEventType == null ? "" : headerEventType;
            if (!("payment.success".equalsIgnoreCase(eventType) || "payment.succeeded".equalsIgnoreCase(eventType) || "invoice.paid".equalsIgnoreCase(eventType))) return "success";
            String eventId = firstText(root, "eventId", "msgId");
            if (eventId.isBlank()) eventId = headerEventId == null ? "" : headerEventId;
            if (eventId.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "UniBee webhook has no event id");
            long invoiceId = invoiceId(root);
            if (invoiceId == 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "UniBee webhook has no invoice reference");
            String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(payload.getBytes(StandardCharsets.UTF_8)));
            PaymentWebhookReceipt receipt = receipts.findByProviderEventId(eventId).orElse(null);
            if (receipt != null) {
                if (!hash.equals(receipt.getPayloadHash()) || !eventType.equalsIgnoreCase(receipt.getEventType())) throw new ResponseStatusException(HttpStatus.CONFLICT, "UniBee event id was reused with different data");
                if (receipt.isProcessed()) return "success";
                receipt.retry();
            } else {
                receipt = PaymentWebhookReceipt.receive(eventId, eventType, invoiceId, hash);
            }
            receipt = persist(receipt);
            try {
                invoices.markPaidFromWebhook(invoiceId);
                receipt.markProcessed();
                receipts.save(receipt);
                return "success";
            } catch (RuntimeException exception) {
                receipt.markFailed(exception.getMessage());
                receipts.save(receipt);
                throw exception;
            }
        } catch (ResponseStatusException exception) { throw exception;
        } catch (Exception exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UniBee webhook payload", exception); }
    }

    private boolean validSignature(String payload, String provided) {
        if (provided == null || provided.isBlank()) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(apiKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            byte[] actual = Base64.getDecoder().decode(provided);
            return MessageDigest.isEqual(expected, actual);
        } catch (Exception exception) { return false; }
    }

    private PaymentWebhookReceipt persist(PaymentWebhookReceipt receipt) {
        try { return receipts.save(receipt); }
        catch (DataIntegrityViolationException exception) { return receipts.findByProviderEventId(receipt.getProviderEventId()).orElseThrow(() -> exception); }
    }

    private long invoiceId(JsonNode root) {
        long direct = root.path("invoiceId").asLong(0);
        if (direct != 0) return direct;
        String reference = firstText(root, "externalPaymentId");
        Matcher matcher = INVOICE_REFERENCE.matcher(reference);
        return matcher.matches() ? Long.parseLong(matcher.group(1)) : 0;
    }

    private String firstText(JsonNode root, String... fields) {
        for (String field : fields) {
            String value = root.path(field).asText("");
            if (!value.isBlank()) return value;
        }
        for (JsonNode child : root) {
            if (child.isObject()) {
                String value = firstText(child, fields);
                if (!value.isBlank()) return value;
            }
        }
        return "";
    }
}
