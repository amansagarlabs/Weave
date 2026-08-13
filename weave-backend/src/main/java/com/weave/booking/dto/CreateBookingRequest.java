package com.weave.booking.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateBookingRequest(@NotNull Long creatorId, Long packageId, @NotNull BigDecimal amount) { }
