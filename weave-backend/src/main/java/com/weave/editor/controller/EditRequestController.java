package com.weave.editor.controller;

import com.weave.editor.dto.CreateEditRequest;
import com.weave.editor.dto.EditRequestResponse;
import com.weave.editor.dto.EditRequestStatus;
import com.weave.editor.service.EditRequestService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/edit-requests")
@PreAuthorize("hasAnyRole('CREATOR', 'EDITOR')")
public class EditRequestController {
    private final EditRequestService requests;
    public EditRequestController(EditRequestService requests) { this.requests = requests; }
    @PostMapping
    EditRequestResponse create(@Valid @RequestBody CreateEditRequest input, Authentication authentication) { return requests.create(authentication.getName(), input); }
    @GetMapping("/{id}")
    EditRequestResponse byId(@PathVariable Long id, Authentication authentication) { return requests.byId(authentication.getName(), id); }
    @PatchMapping("/{id}/status")
    EditRequestResponse status(@PathVariable Long id, @Valid @RequestBody EditRequestStatus input, Authentication authentication) { return requests.status(authentication.getName(), id, input.status()); }
    @PostMapping("/{id}/revision")
    EditRequestResponse revision(@PathVariable Long id, Authentication authentication) { return requests.revision(authentication.getName(), id); }
}
