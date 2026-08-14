package com.weave.editor.repository;

import com.weave.editor.entity.EditorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EditorProfileRepository extends JpaRepository<EditorProfile, Long> { }
