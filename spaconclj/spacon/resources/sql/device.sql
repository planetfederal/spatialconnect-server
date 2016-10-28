

-- name: count-devices-query
-- counts the number of devices
SELECT count(*) AS count
FROM devices WHERE deleted_at IS NULL

-- name: device-list-query
-- gets all the devices
SELECT id,identifier,device_info::json
FROM devices
WHERE deleted_at IS NULL;

-- name: insert-device<!
-- registers a new device
INSERT INTO devices (identifier,device_info,created_at,updated_at)
SELECT :identifier,:device_info::json, NOW(), NOW()
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
UPDATE devices SET identifier = :identifier, updated_at = NOW() WHERE id = :id

-- name: delete-device!
-- deletes the device
UPDATE devices SET deleted_at = NOW() WHERE id = :id
