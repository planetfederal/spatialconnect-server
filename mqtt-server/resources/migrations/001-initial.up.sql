CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS config (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_type VARCHAR(20) NOT NULL,
    version FLOAT,
    uri VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    config_id INTEGER REFERENCES config(id) ON DELETE CASCADE,
    CONSTRAINT unique_storename_per_config UNIQUE (config_id, name)
);

CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    config_id INTEGER REFERENCES config(id) ON DELETE CASCADE,
    CONSTRAINT unique_form_per_configid UNIQUE (name,config_id)
);

CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    config_id INTEGER REFERENCES config(id) ON DELETE CASCADE,
    UNIQUE (name,config_id)
);

CREATE TABLE IF NOT EXISTS device_location (
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    x FLOAT,
    y FLOAT,
    z FLOAT
);

CREATE TABLE IF NOT EXISTS form_def (
    id SERIAL PRIMARY KEY,
    type VARCHAR(15),
    label VARCHAR(60) NOT NULL,
    required boolean,
    form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT unique_label_formid UNIQUE (label,form_id)
);

CREATE TABLE IF NOT EXISTS form_data (
    id SERIAL PRIMARY KEY,
    forms_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
    form_def_id INTEGER REFERENCES form_def(id) ON DELETE CASCADE,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    val VARCHAR(255) NOT NULL
);
