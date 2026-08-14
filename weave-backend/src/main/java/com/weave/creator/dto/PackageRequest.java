package com.weave.creator.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record PackageRequest(
        @NotBlank String contentType,
        @NotNull @DecimalMin("1.00") BigDecimal price,
        @NotNull @Positive Integer deliveryDays,
        @NotNull @Positive Integer revisionsIncluded
) { }
