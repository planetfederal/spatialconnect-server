-- name: find-all
-- Gets all of the users in the database
SELECT * FROM users
WHERE deleted_at IS NULL;

-- name: count-all
-- Gets the total number of users
SELECT COUNT(*) FROM users
WHERE deleted_at IS NULL;

-- name: find-by-id
-- Gets a user by the id
SELECT * FROM users
WHERE id = :id AND deleted_at IS NULL;

-- name: find-by-email
-- Gets a user by the name
SELECT * FROM users
WHERE email = :email AND deleted_at IS NULL;

-- name: create<!
-- Creates a new user and returns it with a db-generated id
INSERT INTO users (name,email,password)
VALUES (:name,:email,:password)
ON CONFLICT (email)
DO UPDATE SET name = :name, password = :password;

-- name: add-team<!
-- Creates a new record in the user_team join table for a newly created user
INSERT INTO user_team (user_id,team_id)
VALUES (:user_id,:team_id);

-- name: find-teams
-- Gets the teams for a given user
SELECT team_id FROM user_team
WHERE user_id = :user_id;

-- name: delete!
-- Deletes a user
UPDATE users SET deleted_at = NOW() WHERE id = :id;
