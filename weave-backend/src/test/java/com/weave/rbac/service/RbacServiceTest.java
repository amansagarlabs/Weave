package com.weave.rbac.service;

import com.weave.rbac.entity.RbacPolicy;
import com.weave.rbac.repository.RbacPolicyRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RbacServiceTest {
    @Test
    void usesPersistedPolicyForRole() {
        RbacPolicyRepository policies = mock(RbacPolicyRepository.class);
        RbacPolicy policy = mock(RbacPolicy.class);
        when(policy.isAllowed()).thenReturn(true);
        when(policies.findByRoleAndResourceAndAction("CREATOR", "PACKAGE", "CREATE"))
                .thenReturn(Optional.of(policy));

        RbacService service = new RbacService(policies);
        var authentication = new UsernamePasswordAuthenticationToken(
                "creator@example.com", "n/a", java.util.List.of(new SimpleGrantedAuthority("ROLE_CREATOR")));

        assertTrue(service.can(authentication, "PACKAGE", "CREATE"));
        verify(policies).findByRoleAndResourceAndAction("CREATOR", "PACKAGE", "CREATE");
    }

    @Test
    void deniesWhenPolicyIsDisabledOrMissing() {
        RbacPolicyRepository policies = mock(RbacPolicyRepository.class);
        RbacPolicy policy = mock(RbacPolicy.class);
        when(policy.isAllowed()).thenReturn(false);
        when(policies.findByRoleAndResourceAndAction("EDITOR", "BOOKING", "DELETE"))
                .thenReturn(Optional.of(policy));

        RbacService service = new RbacService(policies);
        var authentication = new UsernamePasswordAuthenticationToken(
                "editor@example.com", "n/a", java.util.List.of(new SimpleGrantedAuthority("ROLE_EDITOR")));

        assertFalse(service.can(authentication, "BOOKING", "DELETE"));
        assertFalse(service.can(authentication, "MESSAGE", "READ"));
    }

    @Test
    void adminBypassesRolePolicyButCannotBeDisabled() {
        RbacPolicyRepository policies = mock(RbacPolicyRepository.class);
        RbacService service = new RbacService(policies);
        var authentication = new UsernamePasswordAuthenticationToken(
                "admin@example.com", "n/a", java.util.List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        assertTrue(service.can(authentication, "ANY_RESOURCE", "ANY_ACTION"));
        RbacPolicy adminPolicy = mock(RbacPolicy.class);
        when(adminPolicy.getRole()).thenReturn("ADMIN");
        when(policies.findById(1L)).thenReturn(Optional.of(adminPolicy));
        assertThrows(ResponseStatusException.class, () -> service.update(1L, false));
        when(policies.findById(2L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> service.update(2L, true));
    }
}
