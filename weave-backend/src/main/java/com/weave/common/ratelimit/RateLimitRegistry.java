package com.weave.common.ratelimit;

import java.time.Clock;
import java.time.Instant;
import java.util.EnumMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

@Component
public class RateLimitRegistry {
    private final Clock clock;
    private final Map<RateLimitCategory, RateLimitRule> rules = new EnumMap<>(RateLimitCategory.class);
    private final ConcurrentHashMap<String, WindowState> states = new ConcurrentHashMap<>();
    private final AtomicInteger cleanupTick = new AtomicInteger();

    public RateLimitRegistry(Clock clock) {
        this.clock = clock;
        rules.put(RateLimitCategory.AUTH, new RateLimitRule(10, java.time.Duration.ofMinutes(1)));
        rules.put(RateLimitCategory.DISCOVERY, new RateLimitRule(90, java.time.Duration.ofMinutes(1)));
        rules.put(RateLimitCategory.MESSAGES, new RateLimitRule(60, java.time.Duration.ofMinutes(1)));
        rules.put(RateLimitCategory.PAYMENT_LINK, new RateLimitRule(12, java.time.Duration.ofMinutes(1)));
        rules.put(RateLimitCategory.WEBHOOK, new RateLimitRule(60, java.time.Duration.ofMinutes(1)));
    }

    public RateLimitDecision check(RateLimitCategory category, String clientKey) {
        RateLimitRule rule = Objects.requireNonNull(rules.get(category), "missing rate limit rule");
        Instant now = clock.instant();
        long windowMillis = rule.window().toMillis();
        long windowStart = now.toEpochMilli() - (now.toEpochMilli() % windowMillis);
        String key = category.name() + ":" + clientKey + ":" + windowStart;

        WindowState state = states.compute(key, (ignored, current) -> {
            if (current == null) {
                return new WindowState(windowStart, new AtomicInteger(1));
            }
            current.count.incrementAndGet();
            return current;
        });

        int count = state.count.get();
        if (count > rule.limit()) {
            states.remove(key, state);
            long retryAfterSeconds = Math.max(1L, (windowStart + windowMillis - now.toEpochMilli() + 999) / 1000);
            return new RateLimitDecision(false, rule.limit(), 0, Instant.ofEpochMilli(windowStart + windowMillis), retryAfterSeconds);
        }

        cleanupTick.incrementAndGet();
        if (cleanupTick.get() % 256 == 0) {
            cleanup(windowStart);
        }

        return new RateLimitDecision(true, rule.limit(), rule.limit() - count, Instant.ofEpochMilli(windowStart + windowMillis), 0L);
    }

    private void cleanup(long currentWindowStart) {
        long staleBefore = currentWindowStart - 2L * 60_000L;
        states.entrySet().removeIf(entry -> entry.getValue().windowStart < staleBefore);
    }

    private record WindowState(long windowStart, AtomicInteger count) { }
}
