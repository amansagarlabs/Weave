package com.weave.booking.service;

import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.booking.dto.BookingResponse;
import com.weave.booking.entity.Booking;
import com.weave.booking.repository.BookingRepository;
import com.weave.creator.repository.PackageRepository;
import com.weave.notification.service.NotificationService;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BookingServiceTest {
    private static User user(String email, Role role, long id) {
        User user = User.create(email, null, "hash", role);
        user.markEmailVerified();
        try {
            var field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException(exception);
        }
        return user;
    }

    @Test
    void creatorCanAcceptInviteFromPendingBooking() {
        BookingRepository bookings = mock(BookingRepository.class);
        UserRepository users = mock(UserRepository.class);
        PackageRepository packages = mock(PackageRepository.class);
        NotificationService notifications = mock(NotificationService.class);

        User creator = user("creator@example.com", Role.CREATOR, 7L);
        User brand = user("brand@example.com", Role.BRAND, 9L);
        Booking booking = Booking.create(brand.getId(), creator.getId(), null, new BigDecimal("1200.00"));

        when(users.findByEmail("creator@example.com")).thenReturn(Optional.of(creator));
        when(bookings.findById(42L)).thenReturn(Optional.of(booking));
        when(bookings.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingService service = new BookingService(bookings, users, packages, notifications);
        BookingResponse response = service.updateStatus("creator@example.com", 42L, "accepted");

        assertEquals("ACCEPTED", response.status());
        assertTrue(response.statusHistoryJson().contains("ACCEPTED"));
        verify(notifications).create(eq(brand.getId()), eq("Booking status updated"), contains("accepted"), eq("BOOKING"));
    }

    @Test
    void creatorCannotSkipToNegotiating() {
        BookingRepository bookings = mock(BookingRepository.class);
        UserRepository users = mock(UserRepository.class);
        PackageRepository packages = mock(PackageRepository.class);
        NotificationService notifications = mock(NotificationService.class);

        User creator = user("creator@example.com", Role.CREATOR, 7L);
        Booking booking = Booking.create(9L, creator.getId(), null, new BigDecimal("1200.00"));

        when(users.findByEmail("creator@example.com")).thenReturn(Optional.of(creator));
        when(bookings.findById(anyLong())).thenReturn(Optional.of(booking));

        BookingService service = new BookingService(bookings, users, packages, notifications);
        assertThrows(ResponseStatusException.class, () -> service.updateStatus("creator@example.com", 42L, "NEGOTIATING"));
    }

    @Test
    void brandCanReviseAmountBeforeAcceptance() {
        BookingRepository bookings = mock(BookingRepository.class);
        UserRepository users = mock(UserRepository.class);
        PackageRepository packages = mock(PackageRepository.class);
        NotificationService notifications = mock(NotificationService.class);

        User brand = user("brand@example.com", Role.BRAND, 9L);
        User creator = user("creator@example.com", Role.CREATOR, 7L);
        Booking booking = Booking.create(brand.getId(), creator.getId(), null, new BigDecimal("1200.00"));

        when(users.findByEmail("brand@example.com")).thenReturn(Optional.of(brand));
        when(bookings.findById(42L)).thenReturn(Optional.of(booking));
        when(bookings.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingService service = new BookingService(bookings, users, packages, notifications);
        BookingResponse response = service.updateAmount("brand@example.com", 42L, new BigDecimal("1500.00"));

        assertEquals(new BigDecimal("1500.00"), response.amount());
        verify(notifications).create(eq(creator.getId()), eq("Booking amount updated"), contains("1500.00"), eq("BOOKING"));
    }
}
