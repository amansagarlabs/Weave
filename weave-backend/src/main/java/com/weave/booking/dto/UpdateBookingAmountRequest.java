package com.weave.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record UpdateBookingAmountRequest(@NotNull @Positive BigDecimal amount) { }
