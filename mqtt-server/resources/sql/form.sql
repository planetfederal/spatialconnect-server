

-- name: forms-count-query
-- counts all the forms
SELECT count(*) AS cnt
FROM forms

-- name: forms-by-config-id-query
-- counts all the forms
SELECT *
FROM forms WHERE config_id = :config_id

-- name: required-by-form-id-query
-- gets a list of the required fields for a config
SELECT fd.label
FROM forms AS f JOIN form_def AS fd ON f.id = fd.form_id WHERE f.id = :form_id

-- name: form-by-id-query
-- gets form by id
SELECT *
FROM forms
WHERE id = :id

-- name: formdef-by-id-query
-- gets the form definition
SELECT  f.config_id AS fconfigid,
        f.name AS fname,
        fd.id AS fdid,
        fd.type AS fdtype,
        fd.label AS fdlabel,
        fd.required AS fdrequired
FROM forms AS f JOIN form_def AS fd ON f.id = fd.form_id
WHERE f.id = :id;

-- name: form-by-name-query
-- gets form by form name
SELECT *
FROM forms
WHERE name = :name

-- name: formdef-by-name-query
-- gets the form definition
SELECT  f.config_id AS fconfigid,
        f.name AS fname,
        fd.id AS fdid,
        fd.type AS fdtype,
        fd.label AS fdlabel,
        fd.required AS fdrequired
FROM forms AS f JOIN form_def AS fd ON f.id = fd.form_id
WHERE f.name = :name;

-- name: formitem-by-label-query
-- gets the row of one part of a form
SELECT * FROM form_def
WHERE label = :label AND form_id = :form_id;

-- name: formitem-by-id-query
-- gets the row of one part of a form
SELECT * FROM form_def
WHERE id = :id;

-- name: create-form<!
-- creates a new form
INSERT INTO forms (name,config_id)
SELECT :name, :config_id
WHERE NOT EXISTS
 (SELECT 1 FROM forms WHERE name = :name AND config_id = :config_id)

-- name: update-form-query<!
-- updates the form
UPDATE forms SET name = :name WHERE id = :id

-- name: delete-form-query!
-- deletes the form
DELETE FROM forms WHERE id = :id

-- name: add-item<!
-- adds item to form
INSERT INTO form_def (type,label,required,form_id)
VALUES (:type,:label,:required,:form_id)

-- name: find-item-query
-- finds the item
SELECT * FROM form_def WHERE id = :id

-- name: formdata-submit-stmt!
-- persists the form data submission
INSERT INTO form_data (forms_id,form_def_id,device_id,val)
VALUES (:formsid,:formdefid,:deviceid,:val)

-- name: formdata-for-form-id-query
-- gets the data for a form
SELECT da.forms_id forms_id, da.device_id device_id, de.label AS label, da.val AS val FROM form_data da JOIN form_def de ON da.form_def_id = de.id WHERE da.forms_id = :formsid

-- name: count-form-subs-query
-- counts the number of submissions for a form
SELECT count(*) AS cnt
FROM form_data WHERE forms_id = :formsid