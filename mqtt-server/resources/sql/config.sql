
-- name: count-configs-query
-- counts all the configs
SELECT count(*) AS cnt
FROM config

-- name: config-list-query
-- gets all the configs
SELECT *
FROM config

-- name: find-by-id-query
-- gets config by id
SELECT *
FROM config WHERE id = :id LIMIT 1

-- name: find-by-name-query
-- gets configy by name
SELECT *
FROM config WHERE group_name = :group_name LIMIT 1

-- name: create-config<!
-- creates a new config INSERT INTO config (group_name) VALUES (:group_name)
INSERT INTO config (group_name) SELECT :group_name
WHERE NOT EXISTS (SELECT 1 FROM config WHERE group_name = :group_name)

-- name: update-config-query<!
-- updates the device
UPDATE config SET group_name = :group_name WHERE id = :id

-- name: delete-config-query!
-- deletes the config
DELETE FROM config WHERE id = :id