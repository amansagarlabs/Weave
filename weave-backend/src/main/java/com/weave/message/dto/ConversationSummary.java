package com.weave.message.dto;

import java.time.Instant;
import java.math.BigDecimal;

public record ConversationSummary(
        String threadId,
        Long participantId,
        String participantEmail,
        String participantRole,
        String latestBody,
        Instant latestAt,
        Long bookingId,
        String bookingStatus,
        BigDecimal bookingAmount
) { }
