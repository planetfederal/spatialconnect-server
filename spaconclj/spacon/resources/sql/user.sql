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
WHERE email = :email LIMIT 1 AND deleted_at IS NULL;

-- name: create<!
-- Creates a new user and returns it with a db-generated id
INSERT INTO users (name,email,password)
VALUES (:name,:email,:password)
ON CONFLICT (email)
DO UPDATE SET name = :name, password = :password;

-- name: delete!
-- Deletes a user
UPDATE users SET deleted_at = NOW() WHERE id = :id;
