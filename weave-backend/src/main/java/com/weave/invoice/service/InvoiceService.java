package com.weave.invoice.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.booking.entity.Booking;
import com.weave.booking.repository.BookingRepository;
import com.weave.invoice.dto.CreateInvoiceRequest;
import com.weave.invoice.dto.InvoiceResponse;
import com.weave.invoice.dto.UpdateInvoiceRequest;
import com.weave.invoice.entity.Invoice;
import com.weave.invoice.repository.InvoiceRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Set;
import java.time.Instant;
import com.weave.notification.service.NotificationService;

@Service
public class InvoiceService {
    private final InvoiceRepository invoices;
    private final BookingRepository bookings;
    private final UserRepository users;
    private final PaymentLinkService paymentLinks;
    private final TaxCalculationService taxes;
    private final NotificationService notifications;
    public InvoiceService(InvoiceRepository invoices, BookingRepository bookings, UserRepository users, PaymentLinkService paymentLinks, TaxCalculationService taxes, NotificationService notifications) { this.invoices = invoices; this.bookings = bookings; this.users = users; this.paymentLinks = paymentLinks; this.taxes = taxes; this.notifications = notifications; }

    public List<InvoiceResponse> mine(String email) { User user = user(email); return invoices.findByCreatorIdOrBrandIdOrderByCreatedAtDesc(user.getId(), user.getId()).stream().map(invoice -> { if (invoice.markOverdue(Instant.now())) invoices.save(invoice); return InvoiceResponse.from(invoice); }).toList(); }
    public InvoiceResponse create(String email, CreateInvoiceRequest input) {
        User creator = user(email);
        if (!"CREATOR".equals(creator.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only creators can create invoices");
        Booking booking = bookings.findById(input.bookingId()).filter(item -> item.getCreatorId().equals(creator.getId())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (booking.getAmount() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking has no invoice amount");
        if (!"ACCEPTED".equals(booking.getStatus()) && !"CONTENT_DELIVERED".equals(booking.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Invoice can be created after a booking is accepted");
        if (invoices.findByBookingIdAndCreatorId(booking.getId(), creator.getId()).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT, "An invoice already exists for this booking");
        TaxCalculationService.TaxBreakdown tax = taxes.calculate(booking.getAmount(), Boolean.TRUE.equals(input.gstRegistered()), Boolean.TRUE.equals(input.tdsApplicable()));
        Invoice saved;
        try {
            saved = invoices.save(Invoice.draft(booking.getId(), creator.getId(), booking.getBrandId(), booking.getAmount(), input.dueAt(), input.creatorGstin(), input.brandGstin(), input.sacCode(), input.placeOfSupply(), tax.gstRate(), tax.gstAmount(), tax.tdsRate(), tax.tdsAmount(), tax.netPayable()));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An invoice already exists for this booking", exception);
        }
        notifications.create(booking.getBrandId(), "Invoice created", "A creator created invoice #" + saved.getId() + " for booking #" + booking.getId() + ".", "PAYMENT");
        return InvoiceResponse.from(saved);
    }
    public InvoiceResponse updateDraft(String email, Long id, UpdateInvoiceRequest input) {
        User creator = user(email);
        if (!"CREATOR".equals(creator.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only creators can edit invoices");
        Invoice invoice = owned(id, creator.getId());
        if (!"DRAFT".equals(invoice.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Only draft invoices can be edited");
        Booking booking = bookings.findById(invoice.getBookingId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!Set.of("ACCEPTED", "CONTENT_DELIVERED").contains(booking.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "The booking agreement must be accepted before editing an invoice");
        TaxCalculationService.TaxBreakdown tax = taxes.calculate(invoice.getAmount(), Boolean.TRUE.equals(input.gstRegistered()), Boolean.TRUE.equals(input.tdsApplicable()));
        invoice.updateDraft(input.dueAt(), input.creatorGstin(), input.brandGstin(), input.sacCode(), input.placeOfSupply(), tax);
        return InvoiceResponse.from(invoices.save(invoice));
    }
    public InvoiceResponse send(String email, Long id) {
        User creator = user(email);
        Invoice invoice = owned(id, creator.getId());
        if (!"CREATOR".equals(creator.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only creators can send invoices");
        if (!Set.of("DRAFT", "SENT").contains(invoice.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Only draft or sent invoices can create checkout");
        Booking booking = bookings.findById(invoice.getBookingId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!Set.of("ACCEPTED", "CONTENT_DELIVERED").contains(booking.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "The booking agreement must be accepted before sending payment");
        User brand = users.findById(invoice.getBrandId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand account not found"));
        invoice.markSent(paymentLinks.createPaymentLink(invoice, brand.getEmail()));
        InvoiceResponse response = InvoiceResponse.from(invoices.save(invoice));
        notifications.create(invoice.getBrandId(), "UniBee checkout ready", "Invoice #" + invoice.getId() + " is ready. Open the UniBee checkout to complete payment.", "PAYMENT");
        return response;
    }
    public InvoiceResponse markPaidFromWebhook(Long id) { Invoice invoice = invoices.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found")); if (!"PAID".equals(invoice.getStatus())) { invoice.markPaid(Instant.now()); invoices.save(invoice); notifications.create(invoice.getCreatorId(), "Payment received", "Invoice #" + invoice.getId() + " is marked paid from the payment provider webhook.", "PAYMENT"); } return InvoiceResponse.from(invoice); }
    private Invoice owned(Long id, Long userId) { return invoices.findById(id).filter(item -> item.getCreatorId().equals(userId) || item.getBrandId().equals(userId)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found")); }
    private User user(String email) { return users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); }
}
