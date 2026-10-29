package com.weave.brand.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.brand.dto.BrandProfileRequest;
import com.weave.brand.dto.BrandProfileResponse;
import com.weave.brand.entity.BrandProfile;
import com.weave.brand.repository.BrandProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BrandProfileService {
    private final BrandProfileRepository profiles;
    private final UserRepository users;
    public BrandProfileService(BrandProfileRepository profiles, UserRepository users) { this.profiles = profiles; this.users = users; }

    public BrandProfileResponse mine(String email) { User brand = brand(email); return profiles.findById(brand.getId()).map(BrandProfileResponse::from).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand profile not found")); }

    public BrandProfileResponse save(String email, BrandProfileRequest request) { User brand = brand(email); BrandProfile profile = profiles.findById(brand.getId()).orElseGet(() -> BrandProfile.create(brand.getId(), request.companyName().trim(), clean(request.industry()), clean(request.gstin()))); profile.update(request.companyName().trim(), clean(request.industry()), clean(request.gstin())); return BrandProfileResponse.from(profiles.save(profile)); }

    private User brand(String email) { User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); if (!"BRAND".equals(user.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only brand accounts have brand profiles"); return user; }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
