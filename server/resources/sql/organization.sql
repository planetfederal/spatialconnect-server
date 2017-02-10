-- name: organization-list-query
-- gets all the organizations
SELECT id,name
FROM organizations
WHERE deleted_at IS NULL;

-- name: create-organization<!
-- creates an org
INSERT INTO organizations (name)
VALUES (:name);

-- name: update-organization<!
-- updates an org
UPDATE organizations SET name = :name
WHERE id = :id;

-- name: delete-organization!
-- deletes an org
UPDATE organizations SET deleted_at = NOW()
WHERE id = :id;

-- name: find-by-id-query
SELECT id,name FROM organizations WHERE id = :id;
