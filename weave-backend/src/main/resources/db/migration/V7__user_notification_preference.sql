ALTER TABLE users
    ADD COLUMN notification_preference VARCHAR(32) NOT NULL DEFAULT 'EMAIL';
