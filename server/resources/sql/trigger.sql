-- name: trigger-list-query
-- Gets list of all active triggers
SELECT * FROM spacon.triggers WHERE deleted_at IS NULL

-- name: find-by-id-query
-- gets a trigger by its uuid/primary key
SELECT * FROM spacon.triggers WHERE deleted_at IS NULL AND id = :id

-- name: insert-trigger<!
-- inserts a new trigger definition
INSERT INTO spacon.triggers
(name,description,stores,recipients,rules,created_at,updated_at,repeated)
VALUES
(:name,:description,:stores,:recipients::json,:rules::json,NOW(),NOW(),:repeated)

-- name: update-trigger<!
-- updates definition and recipients
UPDATE spacon.triggers SET
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
UPDATE spacon.triggers SET deleted_at = NOW() WHERE id = :id

