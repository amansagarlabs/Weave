package com.weave.auth.dto;

public record SessionResponse(UserResponse user, String accessToken, String refreshToken) { }
