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
