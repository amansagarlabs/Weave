package com.weave.message.dto;

import com.weave.message.entity.Message;
import java.time.Instant;

public record MessageResponse(Long id, String threadId, Long senderId, Long recipientId, String body, Instant createdAt) {
    public static MessageResponse from(Message message) { return new MessageResponse(message.getId(), message.getThreadId(), message.getSenderId(), message.getRecipientId(), message.getBody(), message.getCreatedAt()); }
}
