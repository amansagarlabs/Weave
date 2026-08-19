package com.weave.invoice.service;

import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.booking.entity.Booking;
import com.weave.booking.repository.BookingRepository;
import com.weave.invoice.dto.CreateInvoiceRequest;
import com.weave.invoice.entity.Invoice;
import com.weave.invoice.repository.InvoiceRepository;
import com.weave.notification.service.NotificationService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class InvoiceServiceTest {
    @Test
    void convertsRacedDuplicateInvoiceInsertIntoConflict() {
        InvoiceRepository invoices = mock(InvoiceRepository.class);
        BookingRepository bookings = mock(BookingRepository.class);
        UserRepository users = mock(UserRepository.class);
        PaymentLinkService paymentLinks = mock(PaymentLinkService.class);
        TaxCalculationService taxes = mock(TaxCalculationService.class);
        NotificationService notifications = mock(NotificationService.class);

        User creator = mock(User.class);
        when(creator.getId()).thenReturn(7L);
        when(creator.getRole()).thenReturn(Role.CREATOR);
        Booking booking = mock(Booking.class);
        when(booking.getId()).thenReturn(42L);
        when(booking.getCreatorId()).thenReturn(7L);
        when(booking.getBrandId()).thenReturn(9L);
        when(booking.getAmount()).thenReturn(new BigDecimal("100.00"));
        when(booking.getStatus()).thenReturn("ACCEPTED");

        when(users.findByEmail("creator@example.com")).thenReturn(Optional.of(creator));
        when(bookings.findById(42L)).thenReturn(Optional.of(booking));
        when(invoices.findByBookingIdAndCreatorId(42L, 7L)).thenReturn(Optional.empty());
        when(taxes.calculate(any(), anyBoolean(), anyBoolean()))
                .thenReturn(new TaxCalculationService.TaxBreakdown(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("100.00")));
        when(invoices.save(any(Invoice.class))).thenThrow(new DataIntegrityViolationException("duplicate"));

        InvoiceService service = new InvoiceService(invoices, bookings, users, paymentLinks, taxes, notifications);
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.create("creator@example.com", new CreateInvoiceRequest(42L, Instant.parse("2026-08-19T10:00:00Z"), null, null, null, null, false, false)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verifyNoInteractions(notifications, paymentLinks);
    }
}
