package com.weave.booking.controller;

import com.weave.booking.dto.BookingResponse;
import com.weave.booking.dto.CreateBookingRequest;
import com.weave.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    private final BookingService bookings;

    public BookingController(BookingService bookings) { this.bookings = bookings; }

    @PostMapping
    BookingResponse create(@Valid @RequestBody CreateBookingRequest request, Authentication authentication) { return bookings.create(authentication.getName(), request); }

    @GetMapping
    List<BookingResponse> mine(Authentication authentication) { return bookings.mine(authentication.getName()); }
}
