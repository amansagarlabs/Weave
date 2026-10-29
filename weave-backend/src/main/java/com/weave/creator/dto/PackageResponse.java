package com.weave.creator.dto;

import com.weave.creator.entity.Package;
import java.math.BigDecimal;

public record PackageResponse(Long id, Long ownerId, String contentType, BigDecimal price, Integer deliveryDays, Integer revisionsIncluded, boolean active) {
    public static PackageResponse from(Package item) {
        return new PackageResponse(item.getId(), item.getOwnerId(), item.getContentType(), item.getPrice(), item.getDeliveryDays(), item.getRevisionsIncluded(), item.isActive());
    }
}
