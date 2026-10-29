package com.weave.invoice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.weave.invoice.entity.Invoice;
import java.io.IOException;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UniBeePaymentLinkService implements PaymentLinkService {
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final String baseUrl;
    private final String apiKey;
    private final long gatewayId;
    private final String paymentType;
    private final String appPublicUrl;

    public UniBeePaymentLinkService(ObjectMapper mapper,
            @Value("${weave.billing.unibee.base-url:https://api.unibee.dev}") String baseUrl,
            @Value("${weave.billing.unibee.api-key:}") String apiKey,
            @Value("${weave.billing.unibee.payment-gateway-id:0}") long gatewayId,
            @Value("${weave.billing.unibee.payment-type:}") String paymentType,
            @Value("${weave.app.public-url:http://localhost:3000}") String appPublicUrl) {
        this.mapper = mapper;
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.gatewayId = gatewayId;
        this.paymentType = paymentType == null ? "" : paymentType.trim();
        this.appPublicUrl = appPublicUrl.replaceAll("/+$", "");
    }

    @Override
    public String createPaymentLink(Invoice invoice, String customerEmail) {
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "UNIBEE_API_KEY is not configured");
        }
        if (gatewayId <= 0) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "UNIBEE_PAYMENT_GATEWAY_ID is not configured");
        }
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("gatewayId", gatewayId);
            payload.put("currency", "INR");
            payload.put("totalAmount", invoice.getAmount().movePointRight(2).setScale(0, RoundingMode.UNNECESSARY).longValueExact());
            payload.put("externalPaymentId", "weave-invoice-" + invoice.getId());
            payload.put("externalUserId", "weave-brand-" + invoice.getBrandId());
            payload.put("email", customerEmail);
            payload.put("name", "Weave invoice #" + invoice.getId());
            payload.put("description", "Creator collaboration booking #" + invoice.getBookingId());
            String returnUrl = appPublicUrl + "/brand/bookings/" + invoice.getBookingId() + "?invoiceId=" + invoice.getId();
            payload.put("redirectUrl", returnUrl);
            payload.put("cancelUrl", returnUrl);
            if (!paymentType.isBlank()) payload.put("gatewayPaymentType", paymentType);
            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/merchant/payment/new"))
                    .timeout(Duration.ofSeconds(20)).header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload))).build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee rejected the payment request");
            JsonNode root = mapper.readTree(response.body());
            if (root.path("code").asInt(-1) != 0) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, root.path("message").asText("UniBee rejected the payment request"));
            String link = root.path("data").path("link").asText("");
            if (link.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee returned no checkout link");
            return link;
        } catch (ResponseStatusException exception) { throw exception;
        } catch (IOException exception) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee payment request failed", exception);
        } catch (InterruptedException exception) { Thread.currentThread().interrupt(); throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee payment request was interrupted", exception);
        } catch (ArithmeticException exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice amount cannot be represented in INR paise", exception); }
    }
}
