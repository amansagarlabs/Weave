package com.weave.billing.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.lang.reflect.Field;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UniBeeBillingProviderAdapterTest {
    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void provisionUsesCreateSubscriptionAndReturnsCheckoutLink() throws Exception {
        AtomicReference<String> body = new AtomicReference<>("");
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/merchant/subscription/create_submit", exchange -> respond(exchange, body, """
                {
                  "code": 0,
                  "data": {
                    "paid": false,
                    "link": "https://unibee.example/checkout",
                    "subscription": { "id": "sub_123" },
                    "user": { "id": "user_123" }
                  },
                  "message": "ok",
                  "requestId": "req-1"
                }
                """));
        server.setExecutor(Executors.newSingleThreadExecutor());
        server.start();

        UniBeeBillingProviderAdapter adapter = new UniBeeBillingProviderAdapter(
                new ObjectMapper(),
                "http://localhost:" + server.getAddress().getPort(),
                "test-key",
                "CREATOR_PRO=123",
                "http://localhost:3000/billing",
                "http://localhost:3000/billing"
        );
        User user = persistedUser(42L);

        BillingProvisioningResult result = adapter.provision(user, "CREATOR_PRO", "http://localhost:3000/billing");

        assertEquals("UNIBEE", result.provider());
        assertEquals("PENDING_PAYMENT", result.status());
        assertEquals("sub_123", result.subscriptionId());
        assertEquals("user_123", result.customerId());
        assertEquals("https://unibee.example/checkout", result.portalUrl());
        assertTrue(body.get().contains("\"planId\":123"));
        assertTrue(body.get().contains("\"email\":\"creator@example.com\""));
    }

    @Test
    void portalUsesCustomerPortalSessionApi() throws Exception {
        AtomicReference<String> body = new AtomicReference<>("");
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/merchant/session/customer_portal_url", exchange -> respond(exchange, body, """
                {
                  "code": 0,
                  "data": {
                    "url": "https://unibee.example/portal"
                  },
                  "message": "ok",
                  "requestId": "req-2"
                }
                """));
        server.setExecutor(Executors.newSingleThreadExecutor());
        server.start();

        UniBeeBillingProviderAdapter adapter = new UniBeeBillingProviderAdapter(
                new ObjectMapper(),
                "http://localhost:" + server.getAddress().getPort(),
                "test-key",
                "CREATOR_PRO=123",
                "http://localhost:3000/billing",
                "http://localhost:3000/billing"
        );
        User user = persistedUser(42L);

        String portalUrl = adapter.portalUrl(user, "http://localhost:3000/billing");

        assertEquals("https://unibee.example/portal", portalUrl);
        assertTrue(body.get().contains("\"email\":\"creator@example.com\""));
        assertTrue(body.get().contains("\"externalUserId\":\"42\""));
    }

    private void respond(HttpExchange exchange, AtomicReference<String> body, String response) throws IOException {
        body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    private User persistedUser(long id) throws Exception {
        User user = User.create("creator@example.com", null, "hash", Role.CREATOR);
        user.markEmailVerified();
        Field field = User.class.getDeclaredField("id");
        field.setAccessible(true);
        field.set(user, id);
        return user;
    }
}
