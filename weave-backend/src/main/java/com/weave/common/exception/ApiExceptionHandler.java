package com.weave.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    record ApiError(Instant timestamp, int status, String error, String path, Map<String, String> fieldErrors) { }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> fields = exception.getBindingResult().getFieldErrors().stream().collect(java.util.stream.Collectors.toMap(error -> error.getField(), error -> error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage(), (first, ignored) -> first));
        return ResponseEntity.badRequest().body(new ApiError(Instant.now(), 400, "Validation failed", request.getRequestURI(), fields));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> generic(Exception exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiError(Instant.now(), 500, "Unexpected server error", request.getRequestURI(), Map.of()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> status(ResponseStatusException exception, HttpServletRequest request) {
        int status = exception.getStatusCode().value();
        return ResponseEntity.status(exception.getStatusCode()).body(new ApiError(Instant.now(), status, exception.getReason() == null ? "Request failed" : exception.getReason(), request.getRequestURI(), Map.of()));
    }
}
