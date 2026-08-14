package com.weave.common.ratelimit;

import java.time.Clock;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AbuseProtectionConfig {
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    RateLimitingFilter rateLimitingFilter(RateLimitRegistry registry, ObjectMapper objectMapper) {
        return new RateLimitingFilter(registry, objectMapper);
    }
}
