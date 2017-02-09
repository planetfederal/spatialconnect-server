--  Copyright  Copyright 2016-2017 Boundless, http://boundlessgeo.com
--
--  Licensed under the Apache License, Version 2.0 (the "License");
--  you may not use this file except in compliance with the License.
--  You may obtain a copy of the License at
--
--  http://www.apache.org/licenses/LICENSE-2.0
--
--  Unless required by applicable law or agreed to in writing, software
--  distributed under the License is distributed on an "AS IS" BASIS,
--  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
--  See the License for the specific language governing permissions and
--  limitations under the License.

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
-- Creates a new record in the user_team join table
INSERT INTO user_team (user_id,team_id)
VALUES (:user_id,:team_id);

-- name: remove-team<!
-- Removes a record in the user_team join table
DELETE FROM user_team
WHERE user_id = :user_id AND team_id = :team_id;

-- name: find-teams
-- Gets the teams for a given user
SELECT ut.team_id AS id, t.name FROM user_team ut INNER JOIN teams t ON ut.team_id = t.id
WHERE ut.user_id = :user_id;

-- name: delete!
-- Deletes a user
UPDATE users SET deleted_at = NOW() WHERE id = :id;
