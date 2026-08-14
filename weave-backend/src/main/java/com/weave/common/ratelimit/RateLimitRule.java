package com.weave.common.ratelimit;

import java.time.Duration;

public record RateLimitRule(int limit, Duration window) {
    public RateLimitRule {
        if (limit < 1) {
            throw new IllegalArgumentException("limit must be positive");
        }
        if (window == null || window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("window must be positive");
        }
    }
}
