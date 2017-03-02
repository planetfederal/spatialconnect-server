-- name: find-all
-- Gets all of the users in the database
SELECT * FROM spacon.users
WHERE deleted_at IS NULL;

-- name: count-all
-- Gets the total number of users
SELECT COUNT(*) FROM spacon.users
WHERE deleted_at IS NULL;

-- name: find-by-id
-- Gets a user by the id
SELECT * FROM spacon.users
WHERE id = :id AND deleted_at IS NULL;

-- name: find-by-email
-- Gets a user by the name
SELECT * FROM spacon.users
WHERE email = :email AND deleted_at IS NULL;

-- name: create<!
-- Creates a new user and returns it with a db-generated id
INSERT INTO spacon.users (name,email,password)
VALUES (:name,:email,:password)
ON CONFLICT (email)
DO UPDATE SET name = :name, password = :password;

-- name: add-team<!
-- Creates a new record in the user_team join table
INSERT INTO spacon.user_team (user_id,team_id)
VALUES (:user_id,:team_id);

-- name: remove-team<!
-- Removes a record in the user_team join table
DELETE FROM spacon.user_team
WHERE user_id = :user_id AND team_id = :team_id;

-- name: find-teams
-- Gets the teams for a given user
SELECT ut.team_id AS id, t.name FROM spacon.user_team ut
INNER JOIN spacon.teams t ON ut.team_id = t.id
WHERE ut.user_id = :user_id;

-- name: delete!
-- Deletes a user
UPDATE spacon.users SET deleted_at = NOW() WHERE id = :id;
