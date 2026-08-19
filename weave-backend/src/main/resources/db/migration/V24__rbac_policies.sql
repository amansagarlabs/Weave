CREATE TABLE rbac_policies (
    id BIGSERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL,
    resource VARCHAR(40) NOT NULL,
    action VARCHAR(20) NOT NULL,
    allowed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_rbac_policy UNIQUE (role, resource, action)
);

WITH roles(role) AS (VALUES ('CREATOR'), ('BRAND'), ('EDITOR'), ('ADMIN')),
resources(resource) AS (VALUES ('BOOKING'), ('PACKAGE'), ('PROFILE'), ('EDIT_REQUEST'), ('INVOICE'), ('MESSAGE'), ('DISCOVERY'), ('BILLING')),
actions(action) AS (VALUES ('READ'), ('CREATE'), ('UPDATE'), ('DELETE'))
INSERT INTO rbac_policies (role, resource, action, allowed)
SELECT roles.role, resources.resource, actions.action, FALSE
FROM roles CROSS JOIN resources CROSS JOIN actions;

UPDATE rbac_policies
SET allowed = TRUE
WHERE role = 'ADMIN'
   OR (role = 'CREATOR' AND ((resource = 'BOOKING' AND action IN ('READ', 'UPDATE')) OR (resource IN ('PACKAGE', 'PROFILE', 'EDIT_REQUEST', 'INVOICE', 'MESSAGE') AND action IN ('READ', 'CREATE', 'UPDATE', 'DELETE')) OR (resource = 'DISCOVERY' AND action = 'READ') OR (resource = 'BILLING' AND action IN ('READ', 'UPDATE'))))
   OR (role = 'BRAND' AND ((resource = 'BOOKING' AND action IN ('READ', 'CREATE', 'UPDATE')) OR (resource = 'PACKAGE' AND action = 'READ') OR (resource = 'PROFILE' AND action = 'READ') OR (resource = 'MESSAGE' AND action IN ('READ', 'CREATE', 'UPDATE', 'DELETE')) OR (resource = 'DISCOVERY' AND action = 'READ') OR (resource = 'BILLING' AND action IN ('READ', 'UPDATE'))))
   OR (role = 'EDITOR' AND ((resource IN ('PACKAGE', 'PROFILE', 'EDIT_REQUEST', 'MESSAGE') AND action IN ('READ', 'CREATE', 'UPDATE', 'DELETE')) OR (resource = 'DISCOVERY' AND action = 'READ') OR (resource = 'BILLING' AND action IN ('READ', 'UPDATE'))));
