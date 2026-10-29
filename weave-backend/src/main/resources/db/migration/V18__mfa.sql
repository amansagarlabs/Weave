ALTER TABLE users
    ADD COLUMN mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN mfa_secret VARCHAR(128),
    ADD COLUMN mfa_recovery_code_hashes TEXT;
