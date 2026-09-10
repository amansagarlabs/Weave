-- Align the existing audit hash column with the VARCHAR mapping used by Hibernate.
ALTER TABLE auth_audit_events
    ALTER COLUMN user_agent_hash TYPE VARCHAR(64)
    USING rtrim(user_agent_hash);
