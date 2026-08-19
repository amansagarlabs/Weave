CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    personal BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organization_memberships (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_organization_membership UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_organization_memberships_user ON organization_memberships(user_id, organization_id);
CREATE INDEX idx_organization_memberships_organization ON organization_memberships(organization_id, user_id);

ALTER TABLE users ADD COLUMN active_organization_id BIGINT REFERENCES organizations(id);

INSERT INTO organizations (name, slug, personal, created_by)
SELECT COALESCE(NULLIF(split_part(email, '@', 1), ''), 'Personal') || '''s personal account',
       'personal-' || id,
       TRUE,
       id
FROM users;

INSERT INTO organization_memberships (organization_id, user_id, role)
SELECT id, created_by, 'OWNER'
FROM organizations
WHERE personal = TRUE;

UPDATE users u
SET active_organization_id = o.id
FROM organizations o
WHERE o.created_by = u.id AND o.personal = TRUE;
