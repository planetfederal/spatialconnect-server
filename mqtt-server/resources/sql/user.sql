

-- name: find-by-id-query
-- gets the user by the id
SELECT * FROM users WHERE id = :id;

-- name: find-by-email-query
-- gets the user by the name
SELECT * FROM users WHERE email = :email LIMIT 1;

-- name: create-user<!
-- creates a new user
INSERT INTO users (name,email,password)
VALUES (:name,:email,:password)
ON CONFLICT (email)
DO UPDATE SET name = :name, password = :password;

-- name: delete-user!
-- deletes the user
DELETE FROM users WHERE id = :id;

-- name: upsert-token!
-- inserts a session token
INSERT INTO auth_tokens (id, user_id)
VALUES (:id,:user_id);

-- name: select-token-query
-- find the user's session token
SELECT user_id FROM auth_tokens
WHERE id = :id
AND created_at > current_timestamp - interval '6 hours'