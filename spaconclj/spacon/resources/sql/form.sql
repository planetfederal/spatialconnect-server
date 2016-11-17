-- name: find-all
-- Gets all of the forms in the database
SELECT * FROM forms
WHERE deleted_at IS NULL;

-- name: count-all
-- Gets the total number of forms
SELECT COUNT(*) FROM forms
WHERE deleted_at IS NULL;

-- name: find-by-id
-- Gets a form by the id
SELECT * FROM forms
WHERE id = :id AND deleted_at IS NULL;

-- name: find-by-form-key-and-version
-- Gets a form by the form_key and version
SELECT * FROM forms
WHERE form_key = :form_key AND version = :version AND deleted_at IS NULL;

-- name: find-by-form-key
-- Gets a form by the form_key
SELECT * FROM forms
WHERE form_key = :form_key AND deleted_at IS NULL;

-- name: find-latest-version
-- Gets the latest version for a specific form
SELECT MAX(version) AS version FROM forms
WHERE form_key = :form_key AND team_id = :team_id AND deleted_at IS NULL;

-- name: create<!
-- Creates a new form
INSERT INTO forms (form_key,form_label,version,team_id)
VALUES (:form_key,:form_label,:version,:team_id);

-- name: delete!
-- Deletes a form
UPDATE forms SET deleted_at = NOW() WHERE id = :id;


-- name: find-fields
-- Gets the form fields by the form_key
SELECT * FROM form_fields
WHERE form_id = :form_id AND deleted_at IS NULL;


-- name: create-form-fields<!
-- Creates a new field for a form
INSERT INTO form_fields (
  form_id,
  type,
  field_label,
  field_key,
  is_required,
  "position",
  initial_value,
  minimum,
  maximum,
  exclusive_minimum,
  exclusive_maximum,
  is_integer,
  minimum_length,
  maximum_length,
  pattern,
  options,
  updated_at
)
VALUES (
  :form_id,
  :type,
  :field_label,
  :field_key,
  :is_required,
  :position,
  :initial_value,
  :minimum,
  :maximum,
  :exclusive_minimum,
  :exclusive_maximum,
  :is_integer,
  :minimum_length,
  :maximum_length,
  :pattern,
  :options,
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
  initial_value,
  minimum,
  maximum,
  exclusive_minimum,
  exclusive_maximum,
  is_integer,
  minimum_length,
  maximum_length,
  pattern,
  options,
  updated_at
)
= (
  :form_id,
  :type,
  :field_label,
  :field_key,
  :is_required,
  :position,
  :initial_value,
  :minimum,
  :maximum,
  :exclusive_minimum,
  :exclusive_maximum,
  :is_integer,
  :minimum_length,
  :maximum_length,
  :pattern,
  :options,
  NOW()
)
;

-- name: add-form-data<!
-- Adds form data submitted from a device
INSERT INTO form_data (val,form_id,device_id)
VALUES (:val::jsonb,:form_id,:device_id);

-- name: get-form-data-stats
-- Gets some metadata about the submissions for a form
SELECT COUNT(*), updated_at FROM form_data
WHERE form_id = :form_id GROUP BY updated_at ORDER BY updated_at DESC LIMIT 1;