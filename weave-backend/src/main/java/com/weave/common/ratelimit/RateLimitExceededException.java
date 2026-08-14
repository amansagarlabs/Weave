package com.weave.common.ratelimit;

public class RateLimitExceededException extends RuntimeException {
    private final RateLimitCategory category;
    private final int limit;
    private final long retryAfterSeconds;

    public RateLimitExceededException(RateLimitCategory category, int limit, long retryAfterSeconds) {
        super("Rate limit exceeded");
        this.category = category;
        this.limit = limit;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public RateLimitCategory category() { return category; }
    public int limit() { return limit; }
    public long retryAfterSeconds() { return retryAfterSeconds; }
}
