package com.weave.creator.controller;

import com.weave.creator.dto.CreatorProfileRequest;
import com.weave.creator.dto.CreatorProfileResponse;
import com.weave.creator.service.CreatorProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/creator")
public class CreatorProfileController {
    private final CreatorProfileService profiles;

    public CreatorProfileController(CreatorProfileService profiles) { this.profiles = profiles; }

    @PostMapping("/profile")
    CreatorProfileResponse save(@Valid @RequestBody CreatorProfileRequest request, Authentication authentication) {
        return profiles.save(authentication.getName(), request);
    }

    @GetMapping("/profile/{id}")
    CreatorProfileResponse byId(@PathVariable Long id) { return profiles.byId(id); }

    @GetMapping("/public/{slug}")
    CreatorProfileResponse bySlug(@PathVariable String slug) { return profiles.bySlug(slug); }

    @GetMapping("/discover")
    List<CreatorProfileResponse> discover(@RequestParam(required = false) String category) { return profiles.discover(category); }
}
