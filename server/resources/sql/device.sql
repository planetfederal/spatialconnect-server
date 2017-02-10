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

-- name: count-devices-query
-- counts the number of devices
SELECT count(*) AS count
FROM devices WHERE deleted_at IS NULL

-- name: device-list-query
-- gets all the devices
SELECT id,identifier,name,device_info::json
FROM devices
WHERE deleted_at IS NULL;

-- name: create-device<!
-- registers a new device
INSERT INTO devices (name,identifier,device_info,created_at,updated_at)
SELECT :name,:identifier,:device_info::json, NOW(), NOW()
WHERE NOT EXISTS
(SELECT 1 FROM devices
    WHERE identifier = :identifier)

-- name: find-by-id-query
-- gets device by id
SELECT *
FROM devices
WHERE id = :id AND deleted_at IS NULL

-- name: find-by-identifier-query
-- get device by its identifier
SELECT *
FROM devices
WHERE identifier = :identifier AND deleted_at IS NULL

-- name: update-device<!
-- updates the device
UPDATE devices SET
device_info = :device_info::json,
updated_at = NOW() WHERE identifier = :identifier

-- name: delete-device!
-- deletes the device
UPDATE devices SET deleted_at = NOW() WHERE identifier = :identifier
