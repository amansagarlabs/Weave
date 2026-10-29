package com.weave.organization.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.organization.dto.CreateOrganizationRequest;
import com.weave.organization.dto.OrganizationResponse;
import com.weave.organization.entity.Organization;
import com.weave.organization.entity.OrganizationMembership;
import com.weave.organization.repository.OrganizationMembershipRepository;
import com.weave.organization.repository.OrganizationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class OrganizationService {
    private final OrganizationRepository organizations;
    private final OrganizationMembershipRepository memberships;
    private final UserRepository users;

    public OrganizationService(OrganizationRepository organizations, OrganizationMembershipRepository memberships, UserRepository users) {
        this.organizations = organizations;
        this.memberships = memberships;
        this.users = users;
    }

    @Transactional
    public Organization ensurePersonalOrganization(User user) {
        return organizations.findByCreatedByAndPersonalTrue(user.getId()).orElseGet(() -> {
            Organization organization = organizations.save(Organization.create(user.getEmail().split("@", 2)[0] + "'s personal account", "personal-" + user.getId(), true, user.getId()));
            memberships.save(OrganizationMembership.owner(organization.getId(), user.getId()));
            user.setActiveOrganizationId(organization.getId());
            users.save(user);
            return organization;
        });
    }

    @Transactional
    public List<OrganizationResponse> list(String email) {
        User user = user(email);
        ensureActive(user);
        return memberships.findByUserIdOrderByCreatedAtAsc(user.getId()).stream()
                .map(membership -> organizations.findById(membership.getOrganizationId())
                        .map(organization -> OrganizationResponse.from(organization, membership.getRole(), organization.getId().equals(user.getActiveOrganizationId())))
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional
    public OrganizationResponse create(String email, CreateOrganizationRequest request) {
        User user = user(email);
        ensurePersonalOrganization(user);
        String slug = slug(request.name()) + "-" + user.getId();
        if (organizations.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have an organization with this name");
        }
        Organization organization = organizations.save(Organization.create(request.name().trim(), slug, false, user.getId()));
        OrganizationMembership membership = memberships.save(OrganizationMembership.owner(organization.getId(), user.getId()));
        user.setActiveOrganizationId(organization.getId());
        users.save(user);
        return OrganizationResponse.from(organization, membership.getRole(), true);
    }

    @Transactional
    public OrganizationResponse switchTo(String email, Long organizationId) {
        User user = user(email);
        OrganizationMembership membership = memberships.findByOrganizationIdAndUserId(organizationId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this organization"));
        Organization organization = organizations.findById(organizationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        if (organization.isDisabled()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This organization is disabled");
        user.setActiveOrganizationId(organization.getId());
        users.save(user);
        return OrganizationResponse.from(organization, membership.getRole(), true);
    }

    @Transactional
    public void ensureActive(User user) {
        if (user.getActiveOrganizationId() != null && memberships.existsByOrganizationIdAndUserId(user.getActiveOrganizationId(), user.getId()) && organizations.findById(user.getActiveOrganizationId()).filter(item -> !item.isDisabled()).isPresent()) return;
        Organization personal = ensurePersonalOrganization(user);
        user.setActiveOrganizationId(personal.getId());
        users.save(user);
    }

    @Transactional(readOnly = true)
    public List<com.weave.organization.dto.AdminOrganizationResponse> adminList() {
        return organizations.findAll().stream().map(item -> new com.weave.organization.dto.AdminOrganizationResponse(item.getId(), item.getName(), item.getSlug(), item.isPersonal(), item.isDisabled(), item.getCreatedBy(), memberships.countByOrganizationId(item.getId()), item.getCreatedAt())).toList();
    }

    @Transactional
    public com.weave.organization.dto.AdminOrganizationResponse adminSetDisabled(Long id, boolean disabled) {
        Organization item = organizations.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        if (item.isPersonal()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Personal organizations cannot be disabled");
        if (disabled) item.disable(); else item.restore();
        Organization saved = organizations.save(item);
        return new com.weave.organization.dto.AdminOrganizationResponse(saved.getId(), saved.getName(), saved.getSlug(), saved.isPersonal(), saved.isDisabled(), saved.getCreatedBy(), memberships.countByOrganizationId(saved.getId()), saved.getCreatedAt());
    }

    private User user(String email) { return users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); }

    private String slug(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFKD).replaceAll("[^\\p{ASCII}]", "").toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        return normalized.isBlank() ? "organization" : normalized;
    }
}
