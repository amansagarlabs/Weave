package com.weave.booking.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.booking.dto.BookingResponse;
import com.weave.booking.dto.CreateBookingRequest;
import com.weave.booking.entity.Booking;
import com.weave.creator.entity.Package;
import com.weave.creator.repository.PackageRepository;
import com.weave.booking.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Set;

@Service
public class BookingService {
    private final BookingRepository bookings;
    private final UserRepository users;
    private final PackageRepository packages;

    public BookingService(BookingRepository bookings, UserRepository users, PackageRepository packages) { this.bookings = bookings; this.users = users; this.packages = packages; }

    public BookingResponse create(String email, CreateBookingRequest request) {
        User brand = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!"BRAND".equals(brand.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only brands can create bookings");
        User creator = users.findById(request.creatorId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator not found"));
        if (!"CREATOR".equals(creator.getRole().name())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bookings must target a creator account");
        if (request.packageId() != null) {
            Package item = packages.findByIdAndOwnerTypeAndActiveTrue(request.packageId(), "CREATOR").orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Active package not found"));
            if (!request.creatorId().equals(item.getOwnerId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Package does not belong to the selected creator");
            if (item.getPrice() == null || item.getPrice().compareTo(request.amount()) != 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking amount must match the selected package price");
        }
        return BookingResponse.from(bookings.save(Booking.create(brand.getId(), request.creatorId(), request.packageId(), request.amount())));
    }

    public List<BookingResponse> mine(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return bookings.findByBrandIdOrCreatorIdOrderByCreatedAtDesc(user.getId(), user.getId()).stream().map(BookingResponse::from).toList();
    }

    public BookingResponse byId(String email, Long id) {
        User user = user(email);
        Booking booking = bookings.findById(id).filter(item -> item.getBrandId().equals(user.getId()) || item.getCreatorId().equals(user.getId())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return BookingResponse.from(booking);
    }

    public BookingResponse updateStatus(String email, Long id, String requestedStatus) {
        User user = user(email);
        Booking booking = bookings.findById(id).filter(item -> item.getBrandId().equals(user.getId()) || item.getCreatorId().equals(user.getId())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        String next = requestedStatus.trim().toUpperCase().replace(' ', '_');
        Set<String> allowed = Set.of("PENDING", "NEGOTIATING", "ACCEPTED", "CONTENT_DELIVERED");
        if (!allowed.contains(next)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported booking status");
        if ("BRAND".equals(user.getRole().name()) && !Set.of("NEGOTIATING", "ACCEPTED").contains(next)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brands can move bookings to negotiating or accepted");
        if ("CREATOR".equals(user.getRole().name()) && !Set.of("CONTENT_DELIVERED").contains(next)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Creators can mark accepted work as content delivered");
        booking.moveTo(next);
        return BookingResponse.from(bookings.save(booking));
    }

    private User user(String email) { return users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); }
}
