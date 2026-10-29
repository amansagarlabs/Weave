package com.weave.common.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class RateLimitRegistryTest {
    @Test
    void authLimitTripsAfterConfiguredWindow() {
        MutableClock clock = new MutableClock(Instant.parse("2026-08-14T10:00:00Z"), ZoneId.of("UTC"));
        RateLimitRegistry registry = new RateLimitRegistry(clock);

        RateLimitDecision lastAllowed = null;
        for (int index = 0; index < 10; index++) {
            lastAllowed = registry.check(RateLimitCategory.AUTH, "ip:127.0.0.1");
        }

        assertThat(lastAllowed).isNotNull();
        assertThat(lastAllowed.allowed()).isTrue();
        assertThat(lastAllowed.remaining()).isZero();

        RateLimitDecision denied = registry.check(RateLimitCategory.AUTH, "ip:127.0.0.1");
        assertThat(denied.allowed()).isFalse();
        assertThat(denied.limit()).isEqualTo(10);
        assertThat(denied.retryAfterSeconds()).isGreaterThan(0);
    }

    @Test
    void rateLimitResetsAfterWindowRollsForward() {
        MutableClock clock = new MutableClock(Instant.parse("2026-08-14T10:00:00Z"), ZoneId.of("UTC"));
        RateLimitRegistry registry = new RateLimitRegistry(clock);

        for (int index = 0; index < 12; index++) {
            registry.check(RateLimitCategory.PAYMENT_LINK, "user:creator@example.com");
        }

        assertThat(registry.check(RateLimitCategory.PAYMENT_LINK, "user:creator@example.com").allowed()).isFalse();

        clock.advance(Duration.ofMinutes(1));

        RateLimitDecision reset = registry.check(RateLimitCategory.PAYMENT_LINK, "user:creator@example.com");
        assertThat(reset.allowed()).isTrue();
        assertThat(reset.remaining()).isEqualTo(11);
    }

    private static final class MutableClock extends Clock {
        private Instant instant;
        private final ZoneId zoneId;

        private MutableClock(Instant instant, ZoneId zoneId) {
            this.instant = instant;
            this.zoneId = zoneId;
        }

        private void advance(Duration duration) {
            instant = instant.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return zoneId;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return new MutableClock(instant, zone);
        }

        @Override
        public Instant instant() {
            return instant;
        }
    }
}
