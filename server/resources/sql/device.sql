-- name: count-devices-query
-- counts the number of devices
SELECT count(*) AS count
FROM spacon.devices WHERE deleted_at IS NULL

-- name: device-list-query
-- gets all the devices
SELECT id,identifier,name,device_info::json
FROM spacon.devices
WHERE deleted_at IS NULL;

-- name: create-device<!
-- registers a new device
INSERT INTO spacon.devices (name,identifier,device_info,created_at,updated_at)
SELECT :name,:identifier,:device_info::json, NOW(), NOW()
WHERE NOT EXISTS
(SELECT 1 FROM spacon.devices
    WHERE identifier = :identifier)

-- name: find-by-id-query
-- gets device by id
SELECT *
FROM spacon.devices
WHERE id = :id AND deleted_at IS NULL

-- name: find-by-identifier-query
-- get device by its identifier
SELECT *
FROM spacon.devices
WHERE identifier = :identifier AND deleted_at IS NULL

-- name: update-device<!
-- updates the device
UPDATE spacon.devices SET
device_info = :device_info::json,
updated_at = NOW() WHERE identifier = :identifier

-- name: delete-device!
-- deletes the device
UPDATE spacon.devices SET deleted_at = NOW() WHERE identifier = :identifier
