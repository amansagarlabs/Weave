package com.weave.common.ratelimit;

import java.time.Instant;

public record RateLimitDecision(boolean allowed, int limit, int remaining, Instant resetAt, long retryAfterSeconds) { }
