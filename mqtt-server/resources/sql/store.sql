

-- name: stores-count
-- counts all the stores
SELECT count(*) AS cnt
FROM stores

-- name: stores-by-config-id
-- counts all stores
SELECT *
FROM stores
WHERE config_id = :config_id

-- name: store-by-id-query
-- gets store by id
SELECT *
FROM stores
WHERE id = :id LIMIT 1

-- name: store-by-name-query
-- gets store by store name
SELECT *
FROM stores
WHERE name = :name LIMIT 1

-- name: create-store<!
-- creates a new store
INSERT INTO stores (store_type,version,uri,name,config_id)
SELECT :store_type,:version,:uri,:name,:config_id
WHERE NOT EXISTS
 (SELECT 1 FROM stores
    WHERE name = :name AND config_id = :config_id)

-- name: update-store<!
-- updates the store props
UPDATE stores SET store_type = :store_type, version = :version, uri = :uri, name = :name, config_id = :config_id WHERE id = :id

-- name: delete-store!
-- delets store
DELETE FROM stores WHERE id = :id