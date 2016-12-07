
-- name: team-list-query
-- gets all the organizations
SELECT id,name,organization_id
FROM teams
WHERE deleted_at IS NULL;

-- name: insert-team<!
-- registers a new organization
INSERT INTO teams (name,organization_id)
VALUES (:name,:organizationid)

-- name: find-by-id-query
-- gets organization by id
SELECT id,name,organization_id
FROM teams
WHERE id = :id AND deleted_at IS NULL

-- name: update-team<!
-- updates the organization
UPDATE teams SET
name = :name WHERE id = :id;

-- name: delete-team!
-- deletes the team
UPDATE teams SET deleted_at = NOW() WHERE id = :id

