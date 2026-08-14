package com.weave.common.exception;

import com.weave.common.filter.CorrelationIdFilter;
import com.weave.common.ratelimit.RateLimitExceededException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    record ApiError(Instant timestamp, int status, String error, String path, String correlationId, Map<String, String> fieldErrors) { }

    @ExceptionHandler(RateLimitExceededException.class)
    ResponseEntity<ApiError> rateLimit(RateLimitExceededException exception, HttpServletRequest request) {
        String correlationId = correlationId(request);
        log.warn("rate limit exceeded method={} path={} correlationId={} category={} limit={}", request.getMethod(), request.getRequestURI(), correlationId, exception.category(), exception.limit());
        HttpHeaders headers = new HttpHeaders();
        headers.add("Retry-After", String.valueOf(exception.retryAfterSeconds()));
        headers.add("X-RateLimit-Limit", String.valueOf(exception.limit()));
        headers.add("X-RateLimit-Remaining", "0");
        headers.add("X-RateLimit-Reset", String.valueOf(Instant.now().getEpochSecond() + exception.retryAfterSeconds()));
        return new ResponseEntity<>(new ApiError(Instant.now(), 429, "Too many requests", request.getRequestURI(), correlationId, Map.of()), headers, HttpStatus.TOO_MANY_REQUESTS);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> fields = exception.getBindingResult().getFieldErrors().stream().collect(
                java.util.stream.Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage(),
                        (first, ignored) -> first
                )
        );
        String correlationId = correlationId(request);
        log.warn("validation failed method={} path={} correlationId={} fields={}", request.getMethod(), request.getRequestURI(), correlationId, fields.keySet());
        return ResponseEntity.badRequest().body(new ApiError(Instant.now(), 400, "Validation failed", request.getRequestURI(), correlationId, fields));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> generic(Exception exception, HttpServletRequest request) {
        String correlationId = correlationId(request);
        log.error("unhandled exception method={} path={} correlationId={}", request.getMethod(), request.getRequestURI(), correlationId, exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiError(Instant.now(), 500, "Unexpected server error", request.getRequestURI(), correlationId, Map.of()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> status(ResponseStatusException exception, HttpServletRequest request) {
        int status = exception.getStatusCode().value();
        String correlationId = correlationId(request);
        if (exception.getStatusCode().is5xxServerError()) {
            log.error("status exception method={} path={} correlationId={} status={}", request.getMethod(), request.getRequestURI(), correlationId, status, exception);
        } else {
            log.warn("status exception method={} path={} correlationId={} status={}", request.getMethod(), request.getRequestURI(), correlationId, status);
        }
        String message = status >= 500 ? "Unexpected server error" : Optional.ofNullable(exception.getReason()).orElse("Request failed");
        return ResponseEntity.status(exception.getStatusCode()).body(new ApiError(Instant.now(), status, message, request.getRequestURI(), correlationId, Map.of()));
    }

    private String correlationId(HttpServletRequest request) {
        Object attribute = request.getAttribute(CorrelationIdFilter.REQUEST_ATTRIBUTE);
        if (attribute instanceof String value && !value.isBlank()) {
            return value;
        }
        return Optional.ofNullable(request.getHeader(CorrelationIdFilter.HEADER_NAME)).filter(value -> !value.isBlank()).orElse("unknown");
    }
}
