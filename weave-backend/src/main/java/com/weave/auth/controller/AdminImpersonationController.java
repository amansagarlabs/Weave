package com.weave.auth.controller;

import com.weave.auth.dto.UserResponse;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.auth.security.AuthCookieService;
import com.weave.auth.service.AuthSessionService;
import com.weave.auth.service.AuthAuditService;
import com.weave.admin.service.AdminAuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;

@RestController
@RequestMapping("/admin/impersonation")
public class AdminImpersonationController {
    private final UserRepository users;
    private final AuthSessionService sessions;
    private final AuthCookieService cookies;
    private final AdminAuditService audit;
    private final AuthAuditService authAudit;

    public AdminImpersonationController(UserRepository users, AuthSessionService sessions, AuthCookieService cookies, AdminAuditService audit, AuthAuditService authAudit) {
        this.users = users; this.sessions = sessions; this.cookies = cookies; this.audit = audit; this.authAudit = authAudit;
    }

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    ImpersonationStatus status(HttpServletRequest request) { return new ImpersonationStatus(cookies.impersonator(request) != null && !cookies.impersonator(request).isBlank()); }

    @PostMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    UserResponse start(@PathVariable Long id, Principal principal, HttpServletRequest request, HttpServletResponse response) {
        User target = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (target.isSuspended()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Suspended users cannot be impersonated");
        var adminSession = sessions.create(principal.getName(), request.getHeader("User-Agent"), request.getRemoteAddr());
        var session = sessions.create(target.getEmail(), request.getHeader("User-Agent"), request.getRemoteAddr());
        cookies.setImpersonator(response, adminSession.refreshToken());
        cookies.setImpersonatedRefresh(response, session.refreshToken());
        cookies.setSession(response, session.accessToken(), session.refreshToken());
        audit.record(principal.getName(), "IMPERSONATION_STARTED", "USER", id, "Admin session entered user account");
        authAudit.success("IMPERSONATION_STARTED", principal.getName(), request, "TARGET_USER_ID_" + id);
        return session.user();
    }

    @PostMapping("/stop")
    @PreAuthorize("isAuthenticated()")
    UserResponse stop(HttpServletRequest request, HttpServletResponse response) {
        String adminRefresh = cookies.impersonator(request);
        if (adminRefresh == null || adminRefresh.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No impersonation session is active");
        sessions.revoke(cookies.impersonatedRefresh(request));
        var session = sessions.rotate(adminRefresh, request.getHeader("User-Agent"), request.getRemoteAddr());
        cookies.setSession(response, session.accessToken(), session.refreshToken());
        cookies.clearImpersonator(response);
        authAudit.success("IMPERSONATION_STOPPED", session.user().email(), request, "ADMIN_SESSION_RESTORED");
        return session.user();
    }
}

record ImpersonationStatus(boolean active) { }
