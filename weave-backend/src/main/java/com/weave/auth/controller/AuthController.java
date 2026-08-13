package com.weave.auth.controller;

import com.weave.auth.dto.AuthResponse;
import com.weave.auth.dto.LoginRequest;
import com.weave.auth.dto.SignupRequest;
import com.weave.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/signup")
    AuthResponse signup(@Valid @RequestBody SignupRequest request) { return authService.signup(request); }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request) { return authService.login(request); }
}
