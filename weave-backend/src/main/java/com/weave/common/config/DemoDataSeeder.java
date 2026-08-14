package com.weave.common.config;

import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.brand.entity.BrandProfile;
import com.weave.brand.repository.BrandProfileRepository;
import com.weave.booking.entity.Booking;
import com.weave.booking.repository.BookingRepository;
import com.weave.creator.entity.CreatorProfile;
import com.weave.creator.entity.Package;
import com.weave.creator.repository.CreatorProfileRepository;
import com.weave.creator.repository.PackageRepository;
import com.weave.editor.entity.EditorProfile;
import com.weave.editor.repository.EditorProfileRepository;
import com.weave.editor.entity.EditRequest;
import com.weave.editor.repository.EditRequestRepository;
import com.weave.invoice.entity.Invoice;
import com.weave.invoice.repository.InvoiceRepository;
import com.weave.invoice.service.TaxCalculationService;
import com.weave.message.entity.Message;
import com.weave.message.repository.MessageRepository;
import com.weave.notification.entity.Notification;
import com.weave.notification.repository.NotificationRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.Instant;

/** Development-only accounts and profiles. Never activate the demo profile in production. */
@Component
@Profile("demo")
public class DemoDataSeeder implements CommandLineRunner {
    private static final String PASSWORD = "12345678";
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final CreatorProfileRepository creators;
    private final BrandProfileRepository brands;
    private final EditorProfileRepository editors;
    private final PackageRepository packages;
    private final BookingRepository bookings;
    private final MessageRepository messages;
    private final EditRequestRepository editRequests;
    private final InvoiceRepository invoices;
    private final NotificationRepository notifications;
    private final TaxCalculationService taxes;

    public DemoDataSeeder(UserRepository users, PasswordEncoder passwords, CreatorProfileRepository creators, BrandProfileRepository brands, EditorProfileRepository editors, PackageRepository packages, BookingRepository bookings, MessageRepository messages, EditRequestRepository editRequests, InvoiceRepository invoices, NotificationRepository notifications, TaxCalculationService taxes) {
        this.users = users; this.passwords = passwords; this.creators = creators; this.brands = brands; this.editors = editors; this.packages = packages; this.bookings = bookings; this.messages = messages; this.editRequests = editRequests; this.invoices = invoices; this.notifications = notifications; this.taxes = taxes;
    }

    @Override
    public void run(String... ignored) {
        User creator = account("user@gmail.com", Role.CREATOR);
        User brand = account("brand@gmail.com", Role.BRAND);
        User editor = account("editor@gmail.com", Role.EDITOR);
        account("admin@gmail.com", Role.ADMIN);
        creators.findById(creator.getId()).orElseGet(() -> creators.save(CreatorProfile.create(creator.getId(), "Demo Creator", "demo-creator", "[\"Tech\",\"Lifestyle\"]", "[{\"platform\":\"Instagram\",\"handle\":\"@demo_creator\",\"follower_count\":12000}]", "Bengaluru", "English", "Available for work")));
        brands.findById(brand.getId()).orElseGet(() -> brands.save(BrandProfile.create(brand.getId(), "Demo Brand Co.", "D2C", "29ABCDE1234F1Z5")));
        editors.findById(editor.getId()).orElseGet(() -> editors.save(EditorProfile.create(editor.getId(), "[\"https://example.com/demo-editing\"]")));
        if (packages.findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(creator.getId(), "CREATOR").isEmpty()) packages.save(Package.create(creator.getId(), "CREATOR", "Instagram Reel", new BigDecimal("3500.00"), 5, 2));
        if (packages.findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(editor.getId(), "EDITOR").isEmpty()) packages.save(Package.create(editor.getId(), "EDITOR", "Reel edit", new BigDecimal("1200.00"), 3, 2));
        Package creatorPackage = packages.findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(creator.getId(), "CREATOR").get(0);
        Booking booking = bookings.findByBrandIdAndCreatorId(brand.getId(), creator.getId()).orElseGet(() -> bookings.save(Booking.create(brand.getId(), creator.getId(), creatorPackage.getId(), creatorPackage.getPrice())));
        if ("PENDING".equals(booking.getStatus())) { booking.moveTo("NEGOTIATING"); booking.moveTo("ACCEPTED"); bookings.save(booking); }
        if (messages.findByThreadIdOrderByCreatedAtAsc("demo-booking").isEmpty()) messages.save(Message.create("demo-booking", brand.getId(), creator.getId(), "Hi! We would love to discuss a short product reel for our next launch."));
        if (editRequests.findByCreatorIdOrderByIdDesc(creator.getId()).isEmpty()) editRequests.save(EditRequest.create(creator.getId(), editor.getId()));
        if (invoices.findByBookingIdAndCreatorId(booking.getId(), creator.getId()).isEmpty()) { TaxCalculationService.TaxBreakdown tax = taxes.calculate(booking.getAmount(), true, true); invoices.save(Invoice.draft(booking.getId(), creator.getId(), brand.getId(), booking.getAmount(), Instant.now().plusSeconds(7 * 86400L), "29ABCDE1234F1Z5", "29DEMO1234F1Z5", "998361", "Karnataka", tax.gstRate(), tax.gstAmount(), tax.tdsRate(), tax.tdsAmount(), tax.netPayable())); }
        if (notifications.findByUserIdOrderByCreatedAtDesc(creator.getId()).isEmpty()) {
            notifications.save(Notification.create(creator.getId(), "Your profile is ready for a final pass.", "Add a package or portfolio item to help the right people understand your offer.", "PROFILE"));
            notifications.save(Notification.create(creator.getId(), "Payment-link status stays visible to everyone.", "Weave never describes payment links as escrow or held funds.", "PAYMENT"));
        }
    }

    private User account(String email, Role role) { return users.findByEmail(email).orElseGet(() -> users.save(User.create(email, null, passwords.encode(PASSWORD), role))); }
}
