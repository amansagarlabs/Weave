package com.weave.booking.controller;

import com.weave.booking.dto.BookingResponse;
import com.weave.booking.dto.CreateBookingRequest;
import com.weave.booking.dto.UpdateBookingStatusRequest;
import com.weave.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    private final BookingService bookings;

    public BookingController(BookingService bookings) { this.bookings = bookings; }

    @PostMapping
    @PreAuthorize("hasRole('BRAND')")
    BookingResponse create(@Valid @RequestBody CreateBookingRequest request, Authentication authentication) { return bookings.create(authentication.getName(), request); }

    @GetMapping
    @PreAuthorize("hasAnyRole('BRAND', 'CREATOR')")
    List<BookingResponse> mine(Authentication authentication) { return bookings.mine(authentication.getName()); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('BRAND', 'CREATOR')")
    BookingResponse byId(@PathVariable Long id, Authentication authentication) { return bookings.byId(authentication.getName(), id); }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('BRAND', 'CREATOR')")
    BookingResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateBookingStatusRequest request, Authentication authentication) { return bookings.updateStatus(authentication.getName(), id, request.status()); }
}
