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

-- name: trigger-list-query
-- Gets list of all active triggers
SELECT * FROM triggers WHERE deleted_at IS NULL

-- name: find-by-id-query
-- gets a trigger by its uuid/primary key
SELECT * FROM triggers WHERE deleted_at IS NULL AND id = :id

-- name: insert-trigger<!
-- inserts a new trigger definition
INSERT INTO triggers
(name,description,stores,recipients,rules,created_at,updated_at,repeated)
VALUES
(:name,:description,:stores,:recipients::json,:rules::json,NOW(),NOW(),:repeated)

-- name: update-trigger<!
-- updates definition and recipients
UPDATE triggers SET
name = :name,
description = :description,
stores = :stores,
recipients = :recipients::json,
rules = :rules::json,
updated_at = NOW(),
repeated = :repeated
WHERE id = :id

-- name: delete-trigger!
-- disables a trigger
UPDATE triggers SET deleted_at = NOW() WHERE id = :id

