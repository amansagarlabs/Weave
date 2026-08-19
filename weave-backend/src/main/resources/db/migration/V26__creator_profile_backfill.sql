-- Make every existing creator account discoverable while preserving profiles
-- that were already completed through onboarding.
INSERT INTO creator_profiles (
    user_id,
    display_name,
    public_slug,
    categories_json,
    platforms_json,
    availability_status
)
SELECT
    u.id,
    INITCAP(REPLACE(REPLACE(SPLIT_PART(u.email, '@', 1), '.', ' '), '_', ' ')),
    LEFT('creator-' || u.id, 180),
    '[]'::jsonb,
    '[]'::jsonb,
    'AVAILABLE'
FROM users u
WHERE u.role = 'CREATOR'
  AND NOT EXISTS (
      SELECT 1 FROM creator_profiles profile WHERE profile.user_id = u.id
  );
