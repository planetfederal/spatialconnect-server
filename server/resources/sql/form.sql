-- name: forms-list-query
-- Gets all of the forms in the database
SELECT * FROM spacon.forms
WHERE deleted_at IS NULL;

-- name: count-all
-- Gets the total number of forms
SELECT COUNT(*) FROM spacon.forms
WHERE deleted_at IS NULL;

-- name: find-by-id-query
-- Gets a form by the id
SELECT * FROM spacon.forms
WHERE id = :id AND deleted_at IS NULL;

-- name: find-by-form-key-and-version-query
-- Gets a form by the form_key and version
SELECT * FROM spacon.forms
WHERE form_key = :form_key AND version = :version AND deleted_at IS NULL;

-- name: find-by-form-key-query
-- Gets a form by the form_key
SELECT * FROM spacon.forms
WHERE form_key = :form_key AND deleted_at IS NULL;

-- name: find-latest-version-query
-- Gets the latest version for a specific form
WITH latest AS (
	SELECT MAX(version) AS version
	FROM spacon.forms
	WHERE form_key = :form_key
)
SELECT f.* FROM spacon.forms f
INNER JOIN latest l ON f.version = l.version
WHERE form_key = :form_key;

-- name: create<!
-- Creates a new form
INSERT INTO spacon.forms (form_key,form_label,version,team_id)
VALUES (:form_key,:form_label,:version,:team_id);

-- name: delete!
-- Deletes a form
UPDATE spacon.forms SET deleted_at = NOW() WHERE id = :id;


-- name: find-fields
-- Gets the form fields by the form_key
SELECT * FROM spacon.form_fields
WHERE form_id = :form_id AND deleted_at IS NULL;


-- name: create-form-fields<!
-- Creates a new field for a form
INSERT INTO spacon.form_fields (
  form_id,
  type,
  field_label,
  field_key,
  is_required,
  "position",
  "constraints",
  updated_at
)
VALUES (
  :form_id,
  :type,
  :field_label,
  :field_key,
  :is_required,
  :position,
  :constraints::json,
  NOW()
)
ON CONFLICT (field_key, form_id)
DO UPDATE SET (
  form_id,
  type,
  field_label,
  field_key,
  is_required,
  "position",
  "constraints",
  updated_at
)
= (
  :form_id,
  :type,
  :field_label,
  :field_key,
  :is_required,
  :position,
  :constraints::json,
  NOW()
)
;

-- name: add-form-data<!
-- Adds form data submitted FROM spacon.a device
INSERT INTO spacon.form_data (val,form_id,device_id)
VALUES (:val::jsonb,:form_id,(SELECT id FROM spacon.devices WHERE identifier = :device_identifier));

-- name: form-data-stats-query
-- Gets some metadata about the submissions for a form
SELECT COUNT(*), updated_at FROM spacon.form_data
WHERE form_id = :form_id GROUP BY updated_at ORDER BY updated_at DESC LIMIT 1;

-- name: get-form-data-query
-- Gets the data submissions for a form
SELECT * FROM spacon.form_data
WHERE form_id = :form_id;

-- name: get-form-data-all-query
-- Gets the data submissions for a form for all versions
SELECT * FROM spacon.form_data
WHERE form_id IN (SELECT id FROM spacon.forms WHERE form_key = :form_key)