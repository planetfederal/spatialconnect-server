
-- name: team-list-query
-- gets all the devices
SELECT id,name,organization_id
FROM teams
WHERE deleted_at IS NULL;

-- name: insert-team<!
-- registers a new device
INSERT INTO team (name,organization_id,created_at,updated_at)

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

