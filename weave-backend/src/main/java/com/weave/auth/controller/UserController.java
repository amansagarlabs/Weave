package com.weave.auth.controller;

import com.weave.auth.dto.UpdateUserSettingsRequest;
import com.weave.auth.dto.UserResponse;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.creator.entity.CreatorProfile;
import com.weave.creator.repository.CreatorProfileRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserRepository users;
    private final CreatorProfileRepository creatorProfiles;

    public UserController(UserRepository users, CreatorProfileRepository creatorProfiles) { this.users = users; this.creatorProfiles = creatorProfiles; }

    @GetMapping("/me")
    UserResponse me(Authentication authentication) {
        User user = users.findByEmail(authentication.getName()).orElseThrow();
        String avatarUrl = null;
        if ("CREATOR".equals(user.getRole().name())) {
            avatarUrl = creatorProfiles.findById(user.getId()).map(CreatorProfile::getAvatarUrl).orElse(null);
        }
        return UserResponse.from(user, avatarUrl);
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
