package com.weave.organization.controller;

import com.weave.organization.dto.CreateOrganizationRequest;
import com.weave.organization.dto.OrganizationResponse;
import com.weave.organization.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/organizations")
@PreAuthorize("isAuthenticated()")
public class OrganizationController {
    private final OrganizationService organizations;

    public OrganizationController(OrganizationService organizations) { this.organizations = organizations; }

    @GetMapping
    List<OrganizationResponse> list(Authentication authentication) { return organizations.list(authentication.getName()); }

    @PostMapping
    OrganizationResponse create(Authentication authentication, @Valid @RequestBody CreateOrganizationRequest request) { return organizations.create(authentication.getName(), request); }

    @PostMapping("/{id}/switch")
    OrganizationResponse switchOrganization(Authentication authentication, @PathVariable Long id) { return organizations.switchTo(authentication.getName(), id); }
}
