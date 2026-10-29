ALTER TABLE auth_audit_events
    ALTER COLUMN ip_hash TYPE VARCHAR(64)
    USING rtrim(ip_hash);
