package com.weave.editor.repository;

import com.weave.editor.entity.EditRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EditRequestRepository extends JpaRepository<EditRequest, Long> {
    List<EditRequest> findByCreatorIdOrderByIdDesc(Long creatorId);
    List<EditRequest> findByEditorIdOrderByIdDesc(Long editorId);
}
