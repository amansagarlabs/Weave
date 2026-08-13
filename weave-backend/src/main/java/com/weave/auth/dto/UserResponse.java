package com.weave.auth.dto;

import com.weave.auth.entity.User;

public record UserResponse(Long id, String email, String phone, String role, String locale) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getPhone(), user.getRole().name(), user.getLocale());
    }
}
