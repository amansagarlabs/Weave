-- Kept as a separate migration for environments that already applied V1.
-- Fresh databases receive the column from V1; this migration is idempotent for PostgreSQL.
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS public_slug VARCHAR(180);
UPDATE creator_profiles SET public_slug = CONCAT('creator-', user_id) WHERE public_slug IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_creator_profiles_public_slug ON creator_profiles(public_slug);
ALTER TABLE creator_profiles ALTER COLUMN public_slug SET NOT NULL;
