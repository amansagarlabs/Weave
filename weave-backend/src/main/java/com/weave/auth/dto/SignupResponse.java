package com.weave.auth.dto;

public record SignupResponse(String email, boolean verificationRequired, String message) { }
