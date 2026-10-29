package com.weave.billing.service;

import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.billing.dto.BillingPlanRequest;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class BillingServiceTest {
    private static BillingService service(UserRepository users, BillingProviderAdapter... adapters) {
        return new BillingService(users, new BillingProviderRegistry(List.of(adapters)), "http://localhost:3000/billing");
    }

    private static User creator() {
        User user = User.create("creator@example.com", null, "hash", Role.CREATOR);
        user.markEmailVerified();
        return user;
    }

    @Test
    void freePlanSkipsGatewayAndPersistsLocalState() {
        UserRepository users = mock(UserRepository.class);
        User user = creator();
        when(users.findByEmail("creator@example.com")).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BillingProviderAdapter unibee = mock(BillingProviderAdapter.class);
        BillingService service = service(users, unibee);
        var response = service.updatePlan("creator@example.com", new BillingPlanRequest("FREE", null));

        assertTrue(response.freePlan());
        assertEquals("FREE", response.plan());
        assertEquals("NONE", response.provider());
        assertEquals("ACTIVE", response.status());
        verify(users).save(user);
        verifyNoInteractions(unibee);
    }

    @Test
    void paidPlanDefaultsToUnibeeAdapter() {
        UserRepository users = mock(UserRepository.class);
        User user = creator();
        when(users.findByEmail("creator@example.com")).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BillingProviderAdapter unibee = mock(BillingProviderAdapter.class);
        when(unibee.provider()).thenReturn("UNIBEE");
        when(unibee.provision(any(User.class), any(), any())).thenReturn(new BillingProvisioningResult("UNIBEE", "customer-1", "subscription-1", "https://unibee.example/portal", "ACTIVE", "UniBee manages paid subscriptions and recurring billing; $0 plans stay internal."));
        when(unibee.portalUrl(any(User.class), any())).thenReturn("https://unibee.example/portal");

        BillingService service = service(users, unibee);
        var response = service.updatePlan("creator@example.com", new BillingPlanRequest("CREATOR_PRO", null));

        assertEquals("CREATOR_PRO", response.plan());
        assertEquals("UNIBEE", response.provider());
        assertEquals("https://unibee.example/portal", response.portalUrl());
        assertEquals("ACTIVE", response.status());
        verify(users).save(user);
    }

    @Test
    void unknownProviderIsRejected() {
        UserRepository users = mock(UserRepository.class);
        User user = creator();
        when(users.findByEmail("creator@example.com")).thenReturn(Optional.of(user));

        BillingService service = service(users);
        assertThrows(ResponseStatusException.class, () -> service.updatePlan("creator@example.com", new BillingPlanRequest("CREATOR_PRO", "bogus")));
    }
}
