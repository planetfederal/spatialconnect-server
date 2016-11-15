
-- name: trigger-list-query
-- Gets list of all active triggers
SELECT * FROM triggers WHERE deleted_at IS NULL

-- name: find-by-id-query
-- gets a trigger by its uuid/primary key
SELECT * FROM triggers WHERE deleted_at IS NULL AND id = :id

-- name: insert-trigger<!
-- inserts a new trigger definition
INSERT INTO triggers (name,description,recipients,definition,created_at,updated_at)
VALUES (:name,:description,:recipients,:definition::json,NOW(),NOW())

-- name: update-trigger<!
-- updates definition and recipients
UPDATE triggers SET
name = :name,
description = :description,
recipients = :recipients,
definition = :definition::json,
updated_at = NOW()
WHERE id = :id

-- name: delete-trigger!
-- disables a trigger
UPDATE triggers SET deleted_at = NOW() WHERE id = :id

