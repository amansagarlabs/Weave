package com.weave.editor.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.editor.dto.EditorProfileRequest;
import com.weave.editor.dto.EditorProfileResponse;
import com.weave.editor.entity.EditorProfile;
import com.weave.editor.repository.EditorProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EditorProfileService {
    private final EditorProfileRepository profiles;
    private final UserRepository users;
    public EditorProfileService(EditorProfileRepository profiles, UserRepository users) { this.profiles = profiles; this.users = users; }
    public EditorProfileResponse mine(String email) { User editor = editor(email); return profiles.findById(editor.getId()).map(EditorProfileResponse::from).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Editor profile not found")); }
    public EditorProfileResponse save(String email, EditorProfileRequest request) { User editor = editor(email); String links = request.portfolioLinksJson() == null ? "[]" : request.portfolioLinksJson(); EditorProfile profile = profiles.findById(editor.getId()).orElseGet(() -> EditorProfile.create(editor.getId(), links)); profile.update(links); return EditorProfileResponse.from(profiles.save(profile)); }
    private User editor(String email) { User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); if (!"EDITOR".equals(user.getRole().name())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only editor accounts have editor profiles"); return user; }
}
