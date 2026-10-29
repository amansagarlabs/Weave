ALTER TABLE auth_audit_events
    ALTER COLUMN subject_hash TYPE VARCHAR(64)
    USING rtrim(subject_hash);

ALTER TABLE auth_audit_events
    ALTER COLUMN user_agent_hash TYPE VARCHAR(64)
    USING rtrim(user_agent_hash);