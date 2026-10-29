package com.weave.billing.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.weave.auth.entity.User;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UniBeeBillingProviderAdapter implements BillingProviderAdapter {
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final String baseUrl;
    private final String apiKey;
    private final Map<String, Long> planIds;
    private final String returnUrl;
    private final String cancelUrl;

    public UniBeeBillingProviderAdapter(
            ObjectMapper mapper,
            @Value("${weave.billing.unibee.base-url:https://api.unibee.dev}") String baseUrl,
            @Value("${weave.billing.unibee.api-key:}") String apiKey,
            @Value("${weave.billing.unibee.plan-ids:}") String planIds,
            @Value("${weave.billing.unibee.return-url:http://localhost:3000/billing}") String returnUrl,
            @Value("${weave.billing.unibee.cancel-url:http://localhost:3000/billing}") String cancelUrl
    ) {
        this.mapper = mapper;
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        this.baseUrl = normalizeBaseUrl(baseUrl);
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.planIds = parsePlanIds(planIds);
        this.returnUrl = returnUrl;
        this.cancelUrl = cancelUrl;
    }

    @Override
    public String provider() {
        return "UNIBEE";
    }

    @Override
    public BillingProvisioningResult provision(User user, String plan, String fallbackPortalUrl) {
        ensureConfigured();
        long planId = planId(plan);
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("planId", planId);
            payload.put("email", user.getEmail());
            payload.put("externalUserId", String.valueOf(user.getId()));
            payload.put("returnUrl", returnUrl);
            payload.put("cancelUrl", cancelUrl);
            payload.put("startIncomplete", true);
            payload.put("allowMultipleActiveSubscription", false);

            JsonNode response = post("/merchant/subscription/create_submit", payload);
            if (response.path("code").asInt(-1) != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, response.path("message").asText("UniBee rejected the subscription request"));
            }
            JsonNode data = response.path("data");
            String checkoutUrl = firstText(data, "link", "redirect", "url");
            if (checkoutUrl.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee returned no subscription checkout URL");
            }
            String subscriptionId = firstText(data.path("subscription"), "id", "subscriptionId");
            String customerId = firstText(data.path("user"), "id", "userId");
            boolean paid = data.path("paid").asBoolean(false);
            return new BillingProvisioningResult(provider(), customerId.isBlank() ? null : customerId, subscriptionId.isBlank() ? null : subscriptionId, checkoutUrl, paid ? "ACTIVE" : "PENDING_PAYMENT", paid ? "UniBee subscription active." : "UniBee checkout created. Complete payment to activate recurring billing.");
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee subscription request failed", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee subscription request was interrupted", exception);
        }
    }

    @Override
    public String portalUrl(User user, String fallbackPortalUrl) {
        ensureConfigured();
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("email", user.getEmail());
            payload.put("externalUserId", String.valueOf(user.getId()));
            payload.put("returnUrl", returnUrl);
            payload.put("cancelUrl", cancelUrl);
            JsonNode response = post("/merchant/session/customer_portal_url", payload);
            if (response.path("code").asInt(-1) != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, response.path("message").asText("UniBee rejected the customer portal request"));
            }
            String url = firstText(response.path("data"), "url", "link", "redirect");
            if (!url.isBlank()) {
                return url;
            }
            if (fallbackPortalUrl != null && !fallbackPortalUrl.isBlank()) {
                return fallbackPortalUrl;
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee returned no portal URL");
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee customer portal request failed", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee customer portal request was interrupted", exception);
        }
    }

    private JsonNode post(String path, Map<String, Object> payload) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + path))
                .timeout(Duration.ofSeconds(20))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload)))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "UniBee request failed with HTTP " + response.statusCode());
        }
        return mapper.readTree(response.body());
    }

    private void ensureConfigured() {
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "UniBee billing API key is not configured");
        }
        if (planIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "UniBee plan IDs are not configured");
        }
    }

    private long planId(String plan) {
        Long id = planIds.get(normalizePlan(plan));
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No UniBee plan id configured for " + plan);
        }
        return id;
    }

    private Map<String, Long> parsePlanIds(String config) {
        Map<String, Long> result = new LinkedHashMap<>();
        if (config == null || config.isBlank()) {
            return result;
        }
        for (String entry : config.split(",")) {
            if (entry == null || entry.isBlank()) continue;
            String[] parts = entry.split("=", 2);
            if (parts.length != 2) continue;
            String key = normalizePlan(parts[0]);
            try {
                result.put(key, Long.parseLong(parts[1].trim()));
            } catch (NumberFormatException ignored) {
                // Invalid mappings are ignored so the adapter can still start with the valid ones.
            }
        }
        return result;
    }

    private String normalizePlan(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeBaseUrl(String value) {
        return value == null ? "" : value.trim().replaceAll("/+$", "");
    }

    private String firstText(JsonNode node, String... fields) {
        if (node == null || node.isMissingNode() || node.isNull()) return "";
        for (String field : fields) {
            String value = node.path(field).asText("");
            if (!value.isBlank()) return value;
        }
        return "";
    }
}
