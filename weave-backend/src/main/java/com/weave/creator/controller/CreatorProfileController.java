package com.weave.creator.controller;

import com.weave.creator.dto.CreatorProfileRequest;
import com.weave.creator.dto.CreatorProfileResponse;
import com.weave.creator.service.CreatorProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.weave.creator.dto.PackageResponse;

@RestController
@RequestMapping("/creator")
public class CreatorProfileController {
    private final CreatorProfileService profiles;

    public CreatorProfileController(CreatorProfileService profiles) { this.profiles = profiles; }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('CREATOR')")
    CreatorProfileResponse save(@Valid @RequestBody CreatorProfileRequest request, Authentication authentication) {
        return profiles.save(authentication.getName(), request);
    }

    @GetMapping("/profile/me")
    @PreAuthorize("hasRole('CREATOR')")
    CreatorProfileResponse mine(Authentication authentication) { return profiles.mine(authentication.getName()); }

    @GetMapping("/profile/{id}")
    CreatorProfileResponse byId(@PathVariable Long id) { return profiles.byId(id); }

    @GetMapping("/public/{slug}")
    CreatorProfileResponse bySlug(@PathVariable String slug) { return profiles.bySlug(slug); }

    @GetMapping("/public/{slug}/packages")
    List<PackageResponse> publicPackages(@PathVariable String slug) { return profiles.publicPackages(slug); }

    @GetMapping("/discover")
    List<CreatorProfileResponse> discover(@RequestParam(required = false) String category) { return profiles.discover(category); }
}
