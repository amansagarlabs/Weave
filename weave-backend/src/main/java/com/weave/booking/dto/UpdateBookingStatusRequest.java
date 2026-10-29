package com.weave.booking.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateBookingStatusRequest(@NotBlank String status) { }
