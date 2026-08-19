package com.weave.integration;

import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.booking.entity.Booking;
import com.weave.booking.repository.BookingRepository;
import com.weave.creator.entity.CreatorProfile;
import com.weave.creator.entity.Package;
import com.weave.creator.repository.CreatorProfileRepository;
import com.weave.creator.repository.PackageRepository;
import com.weave.editor.entity.EditRequest;
import com.weave.editor.repository.EditRequestRepository;
import com.weave.invoice.entity.Invoice;
import com.weave.invoice.repository.InvoiceRepository;
import com.weave.invoice.repository.TaxRuleRepository;
import com.weave.message.entity.Message;
import com.weave.message.repository.MessageRepository;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.condition.DisabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisabledIfEnvironmentVariable(named = "TESTCONTAINERS_DISABLED", matches = "true")
class PostgresPersistenceIntegrationTest {
    private static PostgreSQLContainer<?> postgres;

    @Autowired DataSource dataSource;
    @Autowired UserRepository users;
    @Autowired CreatorProfileRepository creatorProfiles;
    @Autowired PackageRepository packages;
    @Autowired BookingRepository bookings;
    @Autowired MessageRepository messages;
    @Autowired InvoiceRepository invoices;
    @Autowired EditRequestRepository editRequests;
    @Autowired TaxRuleRepository taxRules;

    @org.springframework.test.context.DynamicPropertySource
    static void registerProperties(org.springframework.test.context.DynamicPropertyRegistry registry) {
        PostgreSQLContainer<?> container = postgres();
        registry.add("spring.datasource.url", () -> "jdbc:postgresql://" + dockerHost(container) + ":" + container.getMappedPort(5432) + "/weave");
        registry.add("spring.datasource.username", container::getUsername);
        registry.add("spring.datasource.password", container::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("spring.jpa.open-in-view", () -> "false");
        registry.add("spring.flyway.enabled", () -> "false");
    }

    @BeforeAll
    void migrateSchema() {
        PostgreSQLContainer<?> container = postgres();
        Flyway.configure()
                .dataSource("jdbc:postgresql://" + dockerHost(container) + ":" + container.getMappedPort(5432) + "/weave", container.getUsername(), container.getPassword())
                .locations("classpath:db/migration")
                .load()
                .migrate();
    }

    @AfterAll
    static void stopPostgres() {
        if (postgres != null) postgres.stop();
    }

    @Test
    void flywayCreatesCoreTablesAndSeedsTaxRules() throws Exception {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        assertEquals(1L, jdbcTemplate.queryForObject("select count(*) from tax_rules where code = 'GST_STANDARD'", Long.class));
        assertEquals(new BigDecimal("18.0000"), jdbcTemplate.queryForObject("select rate from tax_rules where code = 'GST_STANDARD'", BigDecimal.class));
        assertTrue(columnExists("creator_profiles", "public_slug"));
        assertTrue(columnExists("packages", "active"));
        assertTrue(columnExists("invoices", "gst_rate"));
        assertTrue(columnExists("edit_requests", "suspension_flag"));
    }

    @Test
    void repositoriesPersistAndHonorOwnershipQueries() {
        User creator = users.saveAndFlush(User.create("creator@example.com", null, "hash", Role.CREATOR));
        User brand = users.saveAndFlush(User.create("brand@example.com", null, "hash", Role.BRAND));
        User editor = users.saveAndFlush(User.create("editor@example.com", null, "hash", Role.EDITOR));

        creatorProfiles.saveAndFlush(CreatorProfile.create(
                creator.getId(),
                "Creator One",
                "creator-one",
                "[\"Tech\"]",
                "[\"Instagram\"]",
                "Mumbai",
                "Hindi",
                "Available"
        ));

        Package activePackage = packages.saveAndFlush(Package.create(
                creator.getId(),
                "CREATOR",
                "Short-form video",
                new BigDecimal("15000.00"),
                7,
                2
        ));
        Package secondActivePackage = packages.saveAndFlush(Package.create(
                creator.getId(),
                "CREATOR",
                "Long-form video",
                new BigDecimal("30000.00"),
                14,
                3
        ));
        Package archivedPackage = packages.saveAndFlush(Package.create(
                creator.getId(),
                "CREATOR",
                "Archived package",
                new BigDecimal("5000.00"),
                3,
                1
        ));
        archivedPackage.archive();
        packages.saveAndFlush(archivedPackage);

        Booking firstBooking = bookings.saveAndFlush(Booking.create(
                brand.getId(),
                creator.getId(),
                activePackage.getId(),
                new BigDecimal("15000.00")
        ));
        Booking secondBooking = bookings.saveAndFlush(Booking.create(
                brand.getId(),
                creator.getId(),
                null,
                new BigDecimal("25000.00")
        ));
        secondBooking.moveTo("ACCEPTED");
        bookings.saveAndFlush(secondBooking);

        messages.saveAndFlush(Message.create("booking-" + firstBooking.getId(), brand.getId(), creator.getId(), "Hello"));
        messages.saveAndFlush(Message.create("booking-" + firstBooking.getId(), creator.getId(), brand.getId(), "Reply"));

        Invoice invoice = invoices.saveAndFlush(Invoice.draft(
                firstBooking.getId(),
                creator.getId(),
                brand.getId(),
                new BigDecimal("15000.00"),
                Instant.parse("2026-08-20T00:00:00Z"),
                "27AAAAA0000A1Z5",
                "27BBBBB0000B1Z2",
                "9983",
                "Maharashtra",
                new BigDecimal("18.0000"),
                new BigDecimal("2700.00"),
                new BigDecimal("10.0000"),
                new BigDecimal("1500.00"),
                new BigDecimal("16200.00")
        ));
        EditRequest editRequest = editRequests.saveAndFlush(EditRequest.create(creator.getId(), editor.getId()));

        assertEquals("creator-one", creatorProfiles.findByPublicSlug("creator-one").orElseThrow().getPublicSlug());
        assertEquals(List.of(activePackage.getId(), secondActivePackage.getId()),
                packages.findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(creator.getId(), "CREATOR")
                        .stream()
                        .map(Package::getId)
                        .toList());
        assertEquals(2, packages.findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(creator.getId(), "CREATOR").size());
        assertTrue(packages.findByIdAndOwnerIdAndOwnerType(archivedPackage.getId(), creator.getId(), "CREATOR").isPresent());
        assertFalse(packages.findByIdAndOwnerTypeAndActiveTrue(archivedPackage.getId(), "CREATOR").isPresent());

        assertEquals(List.of(secondBooking.getId(), firstBooking.getId()),
                bookings.findByBrandIdOrCreatorIdOrderByCreatedAtDesc(brand.getId(), creator.getId())
                        .stream()
                        .map(Booking::getId)
                        .toList());

        assertEquals(List.of("Hello", "Reply"),
                messages.findByThreadIdOrderByCreatedAtAsc("booking-" + firstBooking.getId())
                        .stream()
                        .map(Message::getBody)
                        .toList());
        assertEquals(List.of("Hello"),
                messages.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(brand.getId(), creator.getId())
                        .stream()
                        .map(Message::getBody)
                        .toList());
        assertEquals(List.of("Reply"),
                messages.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(creator.getId(), brand.getId())
                        .stream()
                        .map(Message::getBody)
                        .toList());

        assertEquals(firstBooking.getId(), invoices.findByBookingIdAndCreatorId(firstBooking.getId(), creator.getId()).orElseThrow().getBookingId());
        assertEquals(new BigDecimal("16200.00"), invoice.getNetPayable());
        assertEquals("DRAFT", invoice.getStatus());
        assertEquals("PENDING", editRequest.getStatus());
        assertEquals(0, editRequest.getRevisionCount());
        assertTrue(taxRules.findByCodeAndActiveTrue("GST_STANDARD").isPresent());
    }

    private boolean columnExists(String tableName, String columnName) throws Exception {
        try (var connection = dataSource.getConnection();
             ResultSet columns = connection.getMetaData().getColumns(null, null, tableName, columnName)) {
            return columns.next();
        }
    }

    private static PostgreSQLContainer<?> postgres() {
        if (postgres == null) {
            postgres = new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("weave")
                    .withUsername("weave")
                    .withPassword("weave");
            postgres.start();
        }
        return postgres;
    }

    private static String dockerHost(PostgreSQLContainer<?> container) {
        String override = System.getenv("TESTCONTAINERS_HOST_OVERRIDE");
        if (override != null && !override.isBlank()) {
            return override;
        }
        return container.getHost();
    }
}
