package com.weave.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreateBookingRequest(@NotNull Long creatorId, Long packageId, @NotNull @Positive BigDecimal amount) { }
