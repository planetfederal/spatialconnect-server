
-- name: organization-list-query
-- gets all the organizations
SELECT id,name
FROM organizations
WHERE deleted_at IS NULL;