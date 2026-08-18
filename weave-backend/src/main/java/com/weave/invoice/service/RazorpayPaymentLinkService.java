package com.weave.invoice.service;

import com.weave.invoice.entity.Invoice;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class RazorpayPaymentLinkService implements PaymentLinkService {
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final String keyId;
    private final String keySecret;
    private final String apiBaseUrl;

    public RazorpayPaymentLinkService(
            ObjectMapper mapper,
            @Value("${weave.payments.razorpay.key-id:}") String keyId,
            @Value("${weave.payments.razorpay.key-secret:}") String keySecret,
            @Value("${weave.payments.razorpay.api-base-url:https://api.razorpay.com/v1}") String apiBaseUrl
    ) {
        this.mapper = mapper;
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.apiBaseUrl = apiBaseUrl.replaceAll("/+$", "");
    }

    @Override
    public String createPaymentLink(Invoice invoice) {
        if (keyId.isBlank() || keySecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Razorpay payment links are not configured");
        }
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("amount", invoice.getAmount().movePointRight(2).setScale(0, RoundingMode.UNNECESSARY).longValueExact());
            payload.put("currency", "INR");
            payload.put("accept_partial", false);
            payload.put("description", "Weave invoice #" + invoice.getId());
            payload.put("reference_id", "weave-invoice-" + invoice.getId());
            payload.put("notes", Map.of("invoice_id", String.valueOf(invoice.getId()), "booking_id", String.valueOf(invoice.getBookingId())));
            HttpRequest request = HttpRequest.newBuilder(URI.create(apiBaseUrl + "/payment_links"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Basic " + Base64.getEncoder().encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8)))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload)))
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay rejected the payment-link request");
            }
            String shortUrl = mapper.readTree(response.body()).path("short_url").asText("");
            if (shortUrl.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay returned no payment link");
            return shortUrl;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (ArithmeticException | IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice amount cannot be represented in INR paise");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay payment-link request was interrupted");
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay payment-link request failed");
        }
    }
}
