package com.weave.auth.dto;

import com.weave.auth.entity.User;

public record AuthResponse(String accessToken, UserResponse user) {
    public static AuthResponse of(String token, User user) {
        return new AuthResponse(token, UserResponse.from(user));
    }
}
