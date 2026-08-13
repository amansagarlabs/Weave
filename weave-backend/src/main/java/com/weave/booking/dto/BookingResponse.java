package com.weave.booking.dto;

import com.weave.booking.entity.Booking;
import java.math.BigDecimal;
import java.time.Instant;

public record BookingResponse(Long id, Long brandId, Long creatorId, Long packageId, String status, BigDecimal amount, Instant createdAt) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(booking.getId(), booking.getBrandId(), booking.getCreatorId(), booking.getPackageId(), booking.getStatus(), booking.getAmount(), booking.getCreatedAt());
    }
}
