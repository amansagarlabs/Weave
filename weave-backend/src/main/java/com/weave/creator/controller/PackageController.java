package com.weave.creator.controller;

import com.weave.creator.dto.PackageRequest;
import com.weave.creator.dto.PackageResponse;
import com.weave.creator.service.PackageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/creator/packages")
@PreAuthorize("hasRole('CREATOR')")
public class PackageController {
    private final PackageService packages;
    public PackageController(PackageService packages) { this.packages = packages; }

    @GetMapping
    @PreAuthorize("hasRole('CREATOR') and @rbac.can(authentication, 'PACKAGE', 'READ')")
    List<PackageResponse> mine(Authentication authentication) { return packages.mine(authentication.getName()); }

    @PostMapping
    @PreAuthorize("hasRole('CREATOR') and @rbac.can(authentication, 'PACKAGE', 'CREATE')")
    PackageResponse create(@Valid @RequestBody PackageRequest request, Authentication authentication) { return packages.create(authentication.getName(), request); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CREATOR') and @rbac.can(authentication, 'PACKAGE', 'UPDATE')")
    PackageResponse update(@PathVariable Long id, @Valid @RequestBody PackageRequest request, Authentication authentication) { return packages.update(authentication.getName(), id, request); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CREATOR') and @rbac.can(authentication, 'PACKAGE', 'DELETE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void archive(@PathVariable Long id, Authentication authentication) { packages.archive(authentication.getName(), id); }
}
