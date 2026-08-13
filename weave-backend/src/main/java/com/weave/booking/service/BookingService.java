package com.weave.booking.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.booking.dto.BookingResponse;
import com.weave.booking.dto.CreateBookingRequest;
import com.weave.booking.entity.Booking;
import com.weave.booking.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookings;
    private final UserRepository users;

    public BookingService(BookingRepository bookings, UserRepository users) { this.bookings = bookings; this.users = users; }

    public BookingResponse create(String email, CreateBookingRequest request) {
        User brand = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!"BRAND".equals(brand.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only brands can create bookings");
        return BookingResponse.from(bookings.save(Booking.create(brand.getId(), request.creatorId(), request.packageId(), request.amount())));
    }

    public List<BookingResponse> mine(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return bookings.findByBrandIdOrCreatorIdOrderByCreatedAtDesc(user.getId(), user.getId()).stream().map(BookingResponse::from).toList();
    }
}
