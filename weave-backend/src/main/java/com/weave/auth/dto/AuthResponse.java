package com.weave.auth.dto;

import com.weave.auth.entity.User;

public record AuthResponse(String accessToken, UserResponse user, boolean mfaRequired, String mfaToken) {
    public AuthResponse(String accessToken, UserResponse user) {
        this(accessToken, user, false, null);
    }

    public static AuthResponse of(String token, User user) {
        return new AuthResponse(token, UserResponse.from(user));
    }

    public static AuthResponse mfaRequired(User user, String challengeToken) {
        return new AuthResponse(null, UserResponse.from(user), true, challengeToken);
    }
}
