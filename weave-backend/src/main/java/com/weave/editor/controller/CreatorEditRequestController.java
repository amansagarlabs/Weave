package com.weave.editor.controller;

import com.weave.editor.dto.EditRequestResponse;
import com.weave.editor.service.EditRequestService;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/creator/editor-requests")
@PreAuthorize("hasRole('CREATOR')")
public class CreatorEditRequestController {
    private final EditRequestService requests;
    public CreatorEditRequestController(EditRequestService requests) { this.requests = requests; }
    @GetMapping
    List<EditRequestResponse> mine(Authentication authentication) { return requests.creatorMine(authentication.getName()); }
}
