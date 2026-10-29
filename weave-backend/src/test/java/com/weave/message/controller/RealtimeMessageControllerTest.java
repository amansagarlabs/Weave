package com.weave.message.controller;

import com.weave.message.dto.TypingPayload;
import com.weave.message.service.MessageService;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

class RealtimeMessageControllerTest {
    private static Principal principal(String name) {
        Principal p = mock(Principal.class);
        when(p.getName()).thenReturn(name);
        return p;
    }

    @Test
    void nonParticipantCannotTriggerTypingBroadcast() {
        MessageService messages = mock(MessageService.class);
        SimpMessagingTemplate broker = mock(SimpMessagingTemplate.class);
        RealtimeMessageController controller = new RealtimeMessageController(messages, broker);

        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Not a participant"))
            .when(messages).authorizeThread("outsider@example.com", "thread-123");

        TypingPayload payload = new TypingPayload("99", "thread-123");

        assertThrows(ResponseStatusException.class, () ->
            controller.handleTyping("thread-123", payload, principal("outsider@example.com"))
        );

        verify(broker, never()).convertAndSend(anyString(), eq(payload));
    }

    @Test
    void participantTriggersBroadcastToCorrectTopic() {
        MessageService messages = mock(MessageService.class);
        SimpMessagingTemplate broker = mock(SimpMessagingTemplate.class);
        RealtimeMessageController controller = new RealtimeMessageController(messages, broker);

        TypingPayload payload = new TypingPayload("42", "thread-abc");

        assertDoesNotThrow(() ->
            controller.handleTyping("thread-abc", payload, principal("user@example.com"))
        );

        verify(broker).convertAndSend(eq("/topic/thread/thread-abc/typing"), eq(payload));
    }

    @Test
    void rateLimitDropsSecondPublishWithin400ms() {
        MessageService messages = mock(MessageService.class);
        SimpMessagingTemplate broker = mock(SimpMessagingTemplate.class);
        RealtimeMessageController controller = new RealtimeMessageController(messages, broker);

        TypingPayload payload = new TypingPayload("42", "thread-xyz");

        assertDoesNotThrow(() ->
            controller.handleTyping("thread-xyz", payload, principal("user@example.com"))
        );
        assertDoesNotThrow(() ->
            controller.handleTyping("thread-xyz", payload, principal("user@example.com"))
        );

        verify(broker, times(1)).convertAndSend(eq("/topic/thread/thread-xyz/typing"), eq(payload));
    }
}
