package com.weave.auth.controller;

import com.weave.auth.dto.UpdateUserSettingsRequest;
import com.weave.auth.dto.UserResponse;
import com.weave.auth.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserRepository users;

    public UserController(UserRepository users) { this.users = users; }

    @GetMapping("/me")
    UserResponse me(Authentication authentication) {
        return users.findByEmail(authentication.getName()).map(UserResponse::from).orElseThrow();
    }

    @PatchMapping("/me")
    UserResponse updateMe(Authentication authentication, @Valid @RequestBody UpdateUserSettingsRequest request) {
        return users.findByEmail(authentication.getName())
                .map(user -> {
                    user.setLocale(request.locale());
                    user.setNotificationPreference(request.notificationPreference());
                    return UserResponse.from(users.save(user));
                })
                .orElseThrow();
    }
}
