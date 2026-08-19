package com.weave.message.controller;

import com.weave.message.dto.CreateMessageRequest;
import com.weave.message.dto.MessageResponse;
import com.weave.message.dto.ConversationSummary;
import com.weave.message.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {
    private final MessageService messages;

    public MessageController(MessageService messages) { this.messages = messages; }

    @PostMapping
    @PreAuthorize("@rbac.can(authentication, 'MESSAGE', 'CREATE')")
    MessageResponse send(@Valid @RequestBody CreateMessageRequest request, Authentication authentication) { return messages.send(authentication.getName(), request); }

    @GetMapping
    @PreAuthorize("@rbac.can(authentication, 'MESSAGE', 'READ')")
    List<ConversationSummary> inbox(Authentication authentication) { return messages.inbox(authentication.getName()); }

    @GetMapping("/{threadId}")
    @PreAuthorize("@rbac.can(authentication, 'MESSAGE', 'READ')")
    List<MessageResponse> thread(@PathVariable String threadId, Authentication authentication) { return messages.thread(authentication.getName(), threadId); }
}
