package com.weave.editor.controller;

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
@RequestMapping("/editor/gigs")
@PreAuthorize("hasRole('EDITOR')")
public class EditorGigController {
    private final PackageService packages;
    public EditorGigController(PackageService packages) { this.packages = packages; }
    @GetMapping
    List<PackageResponse> mine(Authentication authentication) { return packages.mine(authentication.getName(), "EDITOR", "EDITOR"); }
    @PostMapping
    PackageResponse create(@Valid @RequestBody PackageRequest request, Authentication authentication) { return packages.create(authentication.getName(), request, "EDITOR", "EDITOR"); }
    @PutMapping("/{id}")
    PackageResponse update(@PathVariable Long id, @Valid @RequestBody PackageRequest request, Authentication authentication) { return packages.update(authentication.getName(), id, request, "EDITOR", "EDITOR"); }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void archive(@PathVariable Long id, Authentication authentication) { packages.archive(authentication.getName(), id, "EDITOR", "EDITOR"); }
}
