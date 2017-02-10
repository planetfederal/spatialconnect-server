-- name: store-list-query
-- gets all the stores
SELECT *
FROM stores
WHERE deleted_at IS NULL;

-- name: find-by-id-query
-- gets store by id
SELECT *
FROM stores
WHERE id = :id AND deleted_at IS NULL

-- name: insert-store<!
-- creates a new store
INSERT INTO stores (name,store_type,version,uri,options,default_layers,team_id,created_at,updated_at)
VALUES (:name,:store_type,:version,:uri,:options::json,:default_layers, :team_id, NOW(), NOW())

-- name: update-store<!
-- updates store
UPDATE stores SET
name = :name,
store_type = :store_type,
version = :version,
uri = :uri,
team_id = :team_id,
options = :options::json,
default_layers = :default_layers,
updated_at = NOW()
WHERE id = :id

-- name: delete-store!
-- deletes the store
UPDATE stores SET deleted_at = NOW() WHERE id = :id
