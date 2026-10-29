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
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import com.weave.notification.service.NotificationService;

@Service
public class BookingService {
    private final BookingRepository bookings;
    private final UserRepository users;
    private final PackageRepository packages;
    private final NotificationService notifications;

    public BookingService(BookingRepository bookings, UserRepository users, PackageRepository packages, NotificationService notifications) { this.bookings = bookings; this.users = users; this.packages = packages; this.notifications = notifications; }

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
        Booking saved = bookings.save(Booking.create(brand.getId(), request.creatorId(), request.packageId(), request.amount()));
        notifications.create(creator.getId(), "New booking request", "A brand sent you a booking request. Review the brief and next step.", "BOOKING");
        return BookingResponse.from(saved);
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
        if ("CREATOR".equals(user.getRole().name()) && !Set.of("ACCEPTED", "CONTENT_DELIVERED").contains(next)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Creators can accept booking invites or mark accepted work as content delivered");
        booking.moveTo(next);
        Booking saved = bookings.save(booking);
        Long recipientId = user.getId().equals(booking.getBrandId()) ? booking.getCreatorId() : booking.getBrandId();
        notifications.create(recipientId, "Booking status updated", "Booking #" + booking.getId() + " moved to " + next.replace('_', ' ').toLowerCase() + ".", "BOOKING");
        return BookingResponse.from(saved);
    }

    public BookingResponse updateAmount(String email, Long id, BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking amount must be positive");
        User user = user(email);
        Booking booking = bookings.findById(id).filter(item -> item.getBrandId().equals(user.getId()) || item.getCreatorId().equals(user.getId())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!Set.of("PENDING", "NEGOTIATING").contains(booking.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking amount can only be revised before acceptance");
        booking.changeAmount(amount);
        Booking saved = bookings.save(booking);
        Long recipientId = user.getId().equals(booking.getBrandId()) ? booking.getCreatorId() : booking.getBrandId();
        notifications.create(recipientId, "Booking amount updated", "Booking #" + booking.getId() + " amount is now ₹" + amount.toPlainString() + ". Review and accept when aligned.", "BOOKING");
        return BookingResponse.from(saved);
    }

    private User user(String email) { return users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); }
}
