package com.weave.creator.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.creator.dto.PackageRequest;
import com.weave.creator.dto.PackageResponse;
import com.weave.creator.entity.Package;
import com.weave.creator.repository.PackageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class PackageService {
    private final PackageRepository packages;
    private final UserRepository users;

    public PackageService(PackageRepository packages, UserRepository users) { this.packages = packages; this.users = users; }

    public List<PackageResponse> mine(String email) {
        return mine(email, "CREATOR", "CREATOR");
    }

    public PackageResponse create(String email, PackageRequest request) {
        return create(email, request, "CREATOR", "CREATOR");
    }

    public PackageResponse update(String email, Long id, PackageRequest request) {
        return update(email, id, request, "CREATOR", "CREATOR");
    }

    public List<PackageResponse> mine(String email, String role, String ownerType) {
        User owner = owner(email, role);
        return packages.findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(owner.getId(), ownerType).stream().map(PackageResponse::from).toList();
    }

    public PackageResponse create(String email, PackageRequest request, String role, String ownerType) {
        User owner = owner(email, role);
        return PackageResponse.from(packages.save(Package.create(owner.getId(), ownerType, request.contentType().trim(), request.price(), request.deliveryDays(), request.revisionsIncluded())));
    }

    public PackageResponse update(String email, Long id, PackageRequest request, String role, String ownerType) {
        User owner = owner(email, role);
        Package item = owned(id, owner.getId(), ownerType);
        item.update(request.contentType().trim(), request.price(), request.deliveryDays(), request.revisionsIncluded());
        return PackageResponse.from(packages.save(item));
    }

    public void archive(String email, Long id) {
        archive(email, id, "CREATOR", "CREATOR");
    }

    public void archive(String email, Long id, String role, String ownerType) {
        User owner = owner(email, role);
        Package item = owned(id, owner.getId(), ownerType);
        item.archive();
        packages.save(item);
    }

    private User owner(String email, String expectedRole) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!expectedRole.equals(user.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account cannot manage these packages");
        return user;
    }

    private Package owned(Long id, Long ownerId, String ownerType) {
        return packages.findByIdAndOwnerIdAndOwnerType(id, ownerId, ownerType).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found"));
    }
}
