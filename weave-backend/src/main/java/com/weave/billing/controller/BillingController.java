package com.weave.billing.controller;

import com.weave.billing.dto.BillingAccountResponse;
import com.weave.billing.dto.BillingPlanRequest;
import com.weave.billing.service.BillingService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/billing")
public class BillingController {
    private final BillingService billing;

    public BillingController(BillingService billing) {
        this.billing = billing;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    BillingAccountResponse me(Authentication authentication) {
        return billing.me(authentication.getName());
    }

    @PostMapping("/plan")
    @PreAuthorize("isAuthenticated()")
    BillingAccountResponse updatePlan(Authentication authentication, @Valid @RequestBody BillingPlanRequest request) {
        return billing.updatePlan(authentication.getName(), request);
    }

    @PostMapping("/portal")
    @PreAuthorize("isAuthenticated()")
    BillingAccountResponse portal(Authentication authentication) {
        return billing.portal(authentication.getName());
    }
}
