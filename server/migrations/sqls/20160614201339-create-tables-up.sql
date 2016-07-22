CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.stores
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_type TEXT,
  version TEXT,
  uri TEXT,
  name TEXT,
  default_layers TEXT[],
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.stores
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.forms
(
  id SERIAL PRIMARY KEY,
  form_key TEXT,
  form_label TEXT,
  version integer DEFAULT 0,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  CONSTRAINT key_version_c UNIQUE (form_key,version)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.forms
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.devices
(
  id SERIAL PRIMARY KEY,
  name TEXT,
  identifier TEXT,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.devices
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.device_locations
(
  id SERIAL PRIMARY KEY,
  x double precision,
  y double precision,
  z double precision,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.device_locations
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.form_fields
(
  id SERIAL PRIMARY KEY,
  type TEXT,
  field_label TEXT,
  field_key TEXT,
  is_required boolean,
  "position" integer,
  initial_value TEXT,
  minimum TEXT,
  maximum TEXT,
  exclusive_minimum TEXT,
  exclusive_maximum TEXT,
  is_integer boolean,
  minimum_length integer,
  maximum_length integer,
  pattern TEXT,
  options TEXT[],
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  form_id integer,
  CONSTRAINT form_field_form_id_fkey FOREIGN KEY (form_id)
    REFERENCES public.forms (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT field_key_form_id_pk UNIQUE(field_key,form_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.form_fields
  OWNER TO spacon;

CREATE TABLE IF NOT EXISTS public.form_data
(
  id SERIAL PRIMARY KEY,
  val json,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  deleted_at timestamp with time zone,
  device_id integer,
  form_id integer,
  CONSTRAINT form_data_device_id_fkey FOREIGN KEY (device_id)
    REFERENCES public.devices (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT form_data_form_id_fkey FOREIGN KEY (form_id)
    REFERENCES public.forms (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.form_data
  OWNER TO spacon;

CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS '
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
' LANGUAGE 'plpgsql';

CREATE TABLE IF NOT EXISTS users (
  id          serial PRIMARY KEY,
  name        TEXT NOT NULL CHECK (name <> ''),
  email       TEXT NOT NULL UNIQUE,
  created_at  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  password VARCHAR(72) NOT NULL DEFAULT 'invalid',
  level VARCHAR(12) NOT NULL default 'user'
);

CREATE TRIGGER update_updated_at_users
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE
    PROCEDURE update_updated_at_column();

ALTER TABLE public.users OWNER TO spacon;
