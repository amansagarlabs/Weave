package com.weave.brand.controller;

import com.weave.brand.dto.BrandProfileRequest;
import com.weave.brand.dto.BrandProfileResponse;
import com.weave.brand.service.BrandProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/brand/profile")
@PreAuthorize("hasRole('BRAND')")
public class BrandProfileController {
    private final BrandProfileService profiles;
    public BrandProfileController(BrandProfileService profiles) { this.profiles = profiles; }
    @GetMapping("/me")
    BrandProfileResponse mine(Authentication authentication) { return profiles.mine(authentication.getName()); }
    @PostMapping
    BrandProfileResponse save(@Valid @RequestBody BrandProfileRequest request, Authentication authentication) { return profiles.save(authentication.getName(), request); }
}
