package com.weave.invoice.repository;

import com.weave.invoice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCreatorIdOrBrandIdOrderByCreatedAtDesc(Long creatorId, Long brandId);
    Optional<Invoice> findByBookingIdAndCreatorId(Long bookingId, Long creatorId);
}
