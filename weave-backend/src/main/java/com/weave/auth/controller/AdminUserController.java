package com.weave.auth.controller;

import com.weave.auth.dto.UserResponse;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    private final UserRepository users;
    public AdminUserController(UserRepository users) { this.users = users; }
    @GetMapping
    List<UserResponse> all() { return users.findAll().stream().map(UserResponse::from).toList(); }

    @PatchMapping("/{id}/suspend")
    @ResponseStatus(HttpStatus.OK)
    UserResponse suspend(@PathVariable Long id) {
        User user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.suspend();
        return UserResponse.from(users.save(user));
    }

    @PatchMapping("/{id}/restore")
    @ResponseStatus(HttpStatus.OK)
    UserResponse restore(@PathVariable Long id) {
        User user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.restore();
        return UserResponse.from(users.save(user));
    }
}
