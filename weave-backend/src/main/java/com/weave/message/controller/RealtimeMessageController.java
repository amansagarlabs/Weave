package com.weave.message.controller;

import com.weave.message.dto.CreateMessageRequest;
import com.weave.message.dto.MessageResponse;
import com.weave.message.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;

@Controller
public class RealtimeMessageController {
    private final MessageService messages;
    private final SimpMessagingTemplate broker;

    public RealtimeMessageController(MessageService messages, SimpMessagingTemplate broker) {
        this.messages = messages;
        this.broker = broker;
    }

    @MessageMapping("/messages.send")
    public void send(@Payload CreateMessageRequest request, Principal principal) {
        MessageResponse response = messages.send(principal.getName(), request);
        broker.convertAndSend("/topic/threads/" + request.threadId(), response);
    }
}
