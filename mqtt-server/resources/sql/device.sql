

-- name: count-devices-query
-- counts the number of devices
SELECT count(*) AS count
FROM devices

-- name: device-list-query
-- gets all the devices
SELECT *
FROM devices
WHERE config_id = :config_id

-- name: create-device<!
-- registers a new device
INSERT INTO devices (name,identifier)
SELECT :name, :identifier
WHERE NOT EXISTS
(SELECT 1 FROM devices
    WHERE name = :name AND identifier = :identifier)

-- name: find-by-id-query
-- gets device by id
SELECT *
FROM devices
WHERE id = :id

-- name: find-by-name-query
-- gets device by id
SELECT *
FROM devices
WHERE name = :name

-- name: update-device<!
-- updates the device
UPDATE devices SET name = :name WHERE id = :id

-- name: delete-device!
-- deletes the device
DELETE FROM devices WHERE id = :id