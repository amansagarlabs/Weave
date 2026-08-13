package com.weave.booking.repository;

import com.weave.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBrandIdOrCreatorIdOrderByCreatedAtDesc(Long brandId, Long creatorId);
}
