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

-- name: store-list-query
-- gets all the stores
SELECT *
FROM stores
WHERE deleted_at IS NULL;

-- name: find-by-id-query
-- gets store by id
SELECT *
FROM stores
WHERE id = :id AND deleted_at IS NULL

-- name: insert-store<!
-- creates a new store
INSERT INTO stores (name,store_type,version,uri,options,default_layers,team_id,created_at,updated_at)
VALUES (:name,:store_type,:version,:uri,:options::json,:default_layers, :team_id, NOW(), NOW())

-- name: update-store<!
-- updates store
UPDATE stores SET
name = :name,
store_type = :store_type,
version = :version,
uri = :uri,
team_id = :team_id,
options = :options::json,
default_layers = :default_layers,
updated_at = NOW()
WHERE id = :id

-- name: delete-store!
-- deletes the store
UPDATE stores SET deleted_at = NOW() WHERE id = :id
