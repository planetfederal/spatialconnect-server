
-- name: team-list-query
-- gets all the teams
SELECT id,name,organization_id
FROM teams
WHERE deleted_at IS NULL;

-- name: insert-team<!
-- registers a new team
INSERT INTO teams (name,organization_id)
VALUES (:name,:organization_id)

-- name: find-by-id-query
-- gets team by id
SELECT id,name,organization_id
FROM teams
WHERE id = :id AND deleted_at IS NULL

-- name: update-team<!
-- updates the team
UPDATE teams SET
name = :name WHERE id = :id;

-- name: delete-team!
-- deletes the team
UPDATE teams SET deleted_at = NOW() WHERE id = :id;
DELETE FROM user_team
WHERE team_id = :id;
