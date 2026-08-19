ALTER TABLE packages ADD COLUMN organization_id BIGINT;

UPDATE packages p
SET organization_id = u.active_organization_id
FROM users u
WHERE p.owner_id = u.id
  AND p.organization_id IS NULL;

ALTER TABLE packages
    ADD CONSTRAINT fk_packages_organization
    FOREIGN KEY (organization_id) REFERENCES organizations(id);

CREATE INDEX idx_packages_organization_owner
    ON packages (organization_id, owner_id, owner_type, active);
