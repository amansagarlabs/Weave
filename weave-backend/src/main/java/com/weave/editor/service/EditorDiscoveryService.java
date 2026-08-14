package com.weave.editor.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.creator.repository.PackageRepository;
import com.weave.editor.dto.EditorDiscoveryResponse;
import com.weave.editor.repository.EditorProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class EditorDiscoveryService {
    private final EditorProfileRepository profiles;
    private final PackageRepository packages;
    private final UserRepository users;
    public EditorDiscoveryService(EditorProfileRepository profiles, PackageRepository packages, UserRepository users) { this.profiles = profiles; this.packages = packages; this.users = users; }
    public List<EditorDiscoveryResponse> discover(String email) {
        User creator = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!"CREATOR".equals(creator.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only creator accounts can discover editors");
        return profiles.findAll().stream().map(profile -> EditorDiscoveryResponse.from(profile, packages.findByOwnerIdAndOwnerTypeAndActiveTrueOrderByIdAsc(profile.getUserId(), "EDITOR").stream().map(com.weave.creator.dto.PackageResponse::from).toList())).toList();
    }
}
