package com.weave.editor.controller;

import com.weave.editor.dto.EditorDiscoveryResponse;
import com.weave.editor.service.EditorDiscoveryService;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/editor/discover")
@PreAuthorize("hasRole('CREATOR')")
public class EditorDiscoveryController {
    private final EditorDiscoveryService discovery;
    public EditorDiscoveryController(EditorDiscoveryService discovery) { this.discovery = discovery; }
    @GetMapping
    List<EditorDiscoveryResponse> discover(Authentication authentication) { return discovery.discover(authentication.getName()); }
}
