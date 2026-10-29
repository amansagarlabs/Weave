package com.weave.message.dto;

import java.time.Instant;

public record InboxUpdatePayload(
    String threadId,
    String latestMessagePreview,
    Instant latestMessageAt,
    String senderId,
    String senderName
) {}
