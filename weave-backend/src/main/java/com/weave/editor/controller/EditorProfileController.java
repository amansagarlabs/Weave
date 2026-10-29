package com.weave.editor.controller;

import com.weave.editor.dto.EditorProfileRequest;
import com.weave.editor.dto.EditorProfileResponse;
import com.weave.editor.service.EditorProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/editor/profile")
@PreAuthorize("hasRole('EDITOR')")
public class EditorProfileController {
    private final EditorProfileService profiles;
    public EditorProfileController(EditorProfileService profiles) { this.profiles = profiles; }
    @GetMapping("/me")
    EditorProfileResponse mine(Authentication authentication) { return profiles.mine(authentication.getName()); }
    @PostMapping
    EditorProfileResponse save(@Valid @RequestBody EditorProfileRequest request, Authentication authentication) { return profiles.save(authentication.getName(), request); }
}
