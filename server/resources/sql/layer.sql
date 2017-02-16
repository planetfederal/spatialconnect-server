-- name: create<!
INSERT INTO layers (name, source, extent, properties)
VALUES (:name,:source,:extent,:properties::json);

-- name: find-all
SELECT *
FROM layers
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;

-- name: find-by-id-query
SELECT *
FROM layers
WHERE id = :id;
