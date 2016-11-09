

-- name: store-list-query
-- gets all the stores
SELECT id,store_type,version,uri,name,default_layers
FROM stores
WHERE deleted_at IS NULL;