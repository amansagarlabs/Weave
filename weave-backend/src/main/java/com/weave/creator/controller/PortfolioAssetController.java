package com.weave.creator.controller;

import com.weave.creator.dto.PortfolioAssetResponse;
import com.weave.creator.service.PortfolioAssetService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/creator/portfolio")
@PreAuthorize("hasRole('CREATOR')")
public class PortfolioAssetController {
    private final PortfolioAssetService assets;
    public PortfolioAssetController(PortfolioAssetService assets) { this.assets = assets; }

    @GetMapping
    @PreAuthorize("@rbac.can(authentication, 'PROFILE', 'READ')")
    List<PortfolioAssetResponse> mine(Authentication authentication) { return assets.mine(authentication.getName()); }

    @PostMapping(path = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("@rbac.can(authentication, 'PROFILE', 'UPDATE')")
    PortfolioAssetResponse upload(@RequestParam String title, @RequestPart MultipartFile file, Authentication authentication) { return assets.upload(authentication.getName(), title, file); }

    @PutMapping(path = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("@rbac.can(authentication, 'PROFILE', 'UPDATE')")
    PortfolioAssetResponse update(@PathVariable Long id, @RequestParam(required = false) String title, @RequestPart(required = false) MultipartFile file, Authentication authentication) { return assets.update(authentication.getName(), id, title, file); }

    @DeleteMapping("/{id}")
    @PreAuthorize("@rbac.can(authentication, 'PROFILE', 'UPDATE')")
    void delete(@PathVariable Long id, Authentication authentication) { assets.delete(authentication.getName(), id); }
}
