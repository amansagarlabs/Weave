package com.weave.message.controller;

import com.weave.message.dto.CreateMessageRequest;
import com.weave.message.dto.MessageResponse;
import com.weave.message.dto.TypingPayload;
import com.weave.message.service.MessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import java.security.Principal;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class RealtimeMessageController {
    private final MessageService messages;
    private final SimpMessagingTemplate broker;
    private final ConcurrentHashMap<String, Long> typingRateLimiter = new ConcurrentHashMap<>();
    private static final long TYPING_DEBOUNCE_MS = 400;
    private static final long STALE_ENTRY_THRESHOLD_MS = 60_000;

    public RealtimeMessageController(MessageService messages, SimpMessagingTemplate broker) {
        this.messages = messages;
        this.broker = broker;
    }

    @MessageMapping("/messages.send")
    public void send(@Payload CreateMessageRequest request, Principal principal) {
        MessageResponse response = messages.send(principal.getName(), request);
        broker.convertAndSend("/topic/threads/" + request.threadId(), response);
    }

    @MessageMapping("/thread/{threadId}/typing")
    public void handleTyping(
        @DestinationVariable String threadId,
        @Payload TypingPayload payload,
        Principal principal
    ) {
        messages.authorizeThread(principal.getName(), threadId);

        String key = payload.userId() + ":" + threadId;
        Long lastBroadcast = typingRateLimiter.get(key);
        long now = System.currentTimeMillis();
        if (lastBroadcast != null && (now - lastBroadcast) < TYPING_DEBOUNCE_MS) {
            return;
        }
        typingRateLimiter.put(key, now);

        broker.convertAndSend("/topic/thread/" + threadId + "/typing", payload);
    }

    @Scheduled(fixedDelay = 60_000)
    void cleanupStaleRateLimiterEntries() {
        long cutoff = System.currentTimeMillis() - STALE_ENTRY_THRESHOLD_MS;
        typingRateLimiter.entrySet().removeIf(entry -> entry.getValue() < cutoff);
    }
}
