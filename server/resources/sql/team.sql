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

--name: delete-user-team!
DELETE FROM user_team
WHERE team_id = :id;
