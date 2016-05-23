

-- name: stores-count
-- counts all the stores
SELECT count(*) AS cnt
FROM stores

-- name: stores-query
-- counts all stores
SELECT *
FROM stores

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
INSERT INTO stores (store_type,version,uri,name)
SELECT :store_type,:version,:uri,:name
WHERE NOT EXISTS
 (SELECT 1 FROM stores
    WHERE name = :name)

-- name: update-store<!
-- updates the store props
UPDATE stores SET store_type = :store_type, version = :version, uri = :uri, name = :name
WHERE id = :id

-- name: delete-store!
-- delets store
DELETE FROM stores WHERE id = :id